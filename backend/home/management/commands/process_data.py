# data_manager/management/commands/process_data.py

import os
import shutil
import zipfile
import urllib.request
import numpy as np
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from core.models import Exchanges, Instrument, Percentage
import logging

logger = logging.getLogger(__name__)

REQUIRED_EXCHANGES = {
    "BSE": {"code": "1", "exchange": "BSE", "is_option": False},
    "FON": {"code": "4", "exchange": "NFO", "is_option": True},
    "NSE": {"code": "4", "exchange": "NSE", "is_option": False},
}

class Command(BaseCommand):
    help = 'Processes master data and loads instruments as needed.'

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.NOTICE("Starting data processing..."))

            # Step 1: Handle Exchanges
            self.process_exchanges()

            # Step 2: Handle Instruments for Each Exchange
            self.process_instruments()

            self.stdout.write(self.style.SUCCESS("Data processing completed successfully."))

        except Exception as e:
            logger.error(f"An error occurred during data processing: {e}")
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))

    def process_exchanges(self):
        """
        Downloads and processes the master data if required exchanges are missing.
        """
        # Determine which exchanges are missing
        existing_exchanges = Exchanges.objects.filter(title__in=REQUIRED_EXCHANGES.keys()).values_list('title', flat=True)
        missing_exchanges = set(REQUIRED_EXCHANGES.keys()) - set(existing_exchanges)

        if not missing_exchanges:
            self.stdout.write(self.style.SUCCESS("All required exchanges already exist. Skipping download and extraction."))
            return
        else:
            self.stdout.write(self.style.WARNING(f"Missing exchanges: {', '.join(missing_exchanges)}. Proceeding to download and process."))

        url = "https://directlink.icicidirect.com/NewSecurityMaster/SecurityMaster.zip"
        zip_path = os.path.join(settings.MEDIA_ROOT, "SecurityMaster.zip")
        extracted_path = os.path.join(settings.MEDIA_ROOT, "extracted")

        try:
            # Remove extracted directory if it exists
            if os.path.exists(extracted_path):
                shutil.rmtree(extracted_path)
                self.stdout.write(self.style.WARNING(f"Removed existing directory: {extracted_path}"))

            # Download the zip file
            self.stdout.write(self.style.NOTICE(f"Downloading from {url}..."))
            urllib.request.urlretrieve(url, zip_path)
            self.stdout.write(self.style.SUCCESS(f"Downloaded zip to {zip_path}"))

            # Extract the zip file
            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extractall(extracted_path)
                self.stdout.write(self.style.SUCCESS(f"Extracted zip to {extracted_path}"))

                for extracted_file in zf.namelist():
                    exchange_title = extracted_file[:3]

                    if exchange_title not in REQUIRED_EXCHANGES:
                        self.stdout.write(self.style.WARNING(f"Unknown exchange title: {exchange_title}, skipping."))
                        continue

                    # Check if this exchange is missing
                    if exchange_title not in missing_exchanges:
                        self.stdout.write(self.style.NOTICE(f"Exchange '{exchange_title}' already exists. Skipping update."))
                        continue

                    exchange_file_path = os.path.join("extracted", extracted_file)
                    exchange_info = REQUIRED_EXCHANGES[exchange_title]

                    exchange_qs = Exchanges.objects.filter(title=exchange_title)

                    if exchange_qs.exists():
                        exchange_qs.update(file=exchange_file_path)
                        self.stdout.write(self.style.SUCCESS(f"Updated Exchanges for {exchange_title}"))
                    else:
                        # Create new exchange entry based on the title
                        new_exchange = Exchanges(
                            title=exchange_title,
                            file=exchange_file_path,
                            code=exchange_info["code"],
                            exchange=exchange_info["exchange"],
                            is_option=exchange_info.get("is_option", False),
                        )
                        new_exchange.save()
                        self.stdout.write(self.style.SUCCESS(f"Created new Exchange entry for {exchange_title}"))

            # Clean up
            os.remove(zip_path)
            self.stdout.write(self.style.SUCCESS(f"Removed zip file: {zip_path}"))

            # Optionally remove the extracted files directory
            # shutil.rmtree(extracted_path)
            # self.stdout.write(self.style.WARNING(f"Removed extracted directory: {extracted_path}"))

        except Exception as e:
            logger.error(f"Error processing exchanges: {e}")
            self.stderr.write(self.style.ERROR(f"Error processing exchanges: {e}"))
            raise CommandError(f"Error processing exchanges: {e}")

    def process_instruments(self):
        """
        Loads instrument data for each exchange if no instruments exist for that exchange.
        """
        exchanges = Exchanges.objects.filter(title__in=REQUIRED_EXCHANGES.keys())

        for ins in exchanges:
            self.stdout.write(self.style.NOTICE(f"Processing instruments for Exchange: {ins.title} (ID: {ins.id})"))

            # Check if Instruments already exist for this exchange
            existing_instruments_count = Instrument.objects.filter(exchange=ins).count()
            if existing_instruments_count > 0:
                self.stdout.write(self.style.SUCCESS(f"Instruments for Exchange '{ins.title}' already exist ({existing_instruments_count} records). Skipping data loading."))
                continue
            else:
                self.stdout.write(self.style.WARNING(f"No Instruments found for Exchange '{ins.title}'. Proceeding to load data."))

            try:
                # Initialize list to hold Instrument instances
                ins_list = []
                per, created = Percentage.objects.get_or_create(source=ins.title)
                counter = 0
                all_instruments = set(
                    Instrument.objects.filter(exchange=ins).values_list("token", "short_name")
                )

                # **Corrected Line**: Use ins.file.path instead of os.path.join with FieldFile
                file_path = ins.file.path

                if not os.path.exists(file_path):
                    self.stdout.write(self.style.ERROR(f"File does not exist: {file_path}. Skipping this exchange."))
                    continue

                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()

                total_lines = len(lines) - 1  # Subtract 1 to exclude header

                def count_check(count, is_option=False):
                    limit = 1000
                    if is_option:
                        limit = 30000
                    return count < limit

                for index, line in enumerate(lines):
                    if index == 0:  # Skip header
                        continue

                    data = [item.replace('"', "").strip() for item in line.split(",")]

                    if len(data) < 7:
                        self.stdout.write(self.style.WARNING(f"Skipping malformed line {index + 1}: {line.strip()}"))
                        continue

                    token_shortname_tuple = (data[0], data[1])
                    if token_shortname_tuple in all_instruments:
                        continue

                    try:
                        if ins.is_option:
                            expiry_date = datetime.strptime(data[4], "%d-%b-%Y").date() if data[4] else None
                            strike_price = float(data[5]) if data[5] else 0.0
                            stock = Instrument(
                                exchange=ins,
                                stock_token=f"{ins.code}.1!{data[0]}",
                                token=data[0],
                                instrument=data[1],
                                short_name=data[2],
                                series=data[3],
                                company_name=data[3],
                                expiry=expiry_date,
                                strike_price=strike_price,
                                option_type=data[6],
                                exchange_code=data[-1].strip(),
                            )
                        else:
                            stock = Instrument(
                                exchange=ins,
                                stock_token=f"{ins.code}.1!{data[0]}",
                                token=data[0],
                                short_name=data[1],
                                series=data[2],
                                company_name=data[3],
                                exchange_code=data[-1].strip(),
                            )

                        ins_list.append(stock)
                        counter += 1

                        # Update percentage after processing every 100 lines or when limit is reached
                        if not count_check(counter, ins.is_option):
                            per.value = (index / total_lines) * 100
                            per.save()
                            self.stdout.write(self.style.NOTICE(f"Progress: {per.value:.2f}%"))
                            counter = 0

                    except Exception as e:
                        logger.error(f"Error processing line {index + 1}: {e}")
                        self.stdout.write(self.style.ERROR(f"Error processing line {index + 1}: {e}"))

                # Final update to ensure percentage is correct
                per.value = 100
                per.save()
                self.stdout.write(self.style.SUCCESS("Data loading progress set to 100%"))

                if ins_list:
                    our_array = np.array(ins_list)
                    chunk_size = 800
                    chunked_arrays = np.array_split(our_array, max(len(ins_list) // chunk_size, 1))
                    chunked_list = [list(array) for array in chunked_arrays]
                    for ch in chunked_list:
                        Instrument.objects.bulk_create(ch)
                        self.stdout.write(self.style.SUCCESS(f"Inserted chunk of {len(ch)} instruments"))

                    self.stdout.write(self.style.SUCCESS(f"Data loading for Exchange '{ins.title}' completed successfully."))
                else:
                    self.stdout.write(self.style.WARNING(f"No new instruments to load for Exchange '{ins.title}'."))

            except Percentage.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Percentage entry with source '{ins.title}' does not exist. Skipping data loading for this exchange."))
            except Exception as e:
                logger.error(f"An unexpected error occurred while loading instruments for Exchange '{ins.title}': {e}")
                self.stderr.write(self.style.ERROR(f"An unexpected error occurred while loading instruments for Exchange '{ins.title}': {e}"))
