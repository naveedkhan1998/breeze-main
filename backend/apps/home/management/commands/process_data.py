# data_manager/management/commands/process_data.py

import csv
from datetime import datetime, timedelta
import logging
from pathlib import Path
import shutil
import urllib.request
import zipfile

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.core.models import Exchanges, Instrument, Percentage

logger = logging.getLogger(__name__)

REQUIRED_EXCHANGES = {
    "BSE": {"code": "1", "exchange": "BSE", "is_option": False},
    "FON": {"code": "4", "exchange": "NFO", "is_option": True},
    "NSE": {"code": "4", "exchange": "NSE", "is_option": False},
}

CHUNK_SIZE = 1000  # Number of records to process in bulk


class Command(BaseCommand):
    help = "Processes master data and loads instruments as needed."

    def handle(self, *args, **options):
        try:
            self.stdout.write(self.style.NOTICE("Starting data processing..."))

            # Step 1: Handle Exchanges
            self.process_exchanges()

            # Step 2: Handle Instruments for Each Exchange
            self.process_instruments()

            self.stdout.write(
                self.style.SUCCESS("Data processing completed successfully.")
            )

        except Exception as e:
            logger.error("An error occurred during data processing", exc_info=True)
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))

    def needs_reprocessing(self, exchange):
        """
        Check if an exchange needs reprocessing based on date criteria.
        Returns True if:
        - created_at is None
        - updated_at is None
        - updated_at is more than 7 days old
        """
        if exchange.created_at is None or exchange.updated_at is None:
            return True

        seven_days_ago = timezone.now() - timedelta(days=7)
        return exchange.updated_at < seven_days_ago

    def process_exchanges(self):
        """
        Downloads and processes the master data if required exchanges are missing or outdated.
        """
        existing_exchanges = Exchanges.objects.filter(title__in=REQUIRED_EXCHANGES.keys())
        existing_exchange_titles = set(existing_exchanges.values_list("title", flat=True))
        missing_exchanges = set(REQUIRED_EXCHANGES.keys()) - existing_exchange_titles

        # Check for exchanges that need reprocessing due to date criteria
        outdated_exchanges = []
        for exchange in existing_exchanges:
            if self.needs_reprocessing(exchange):
                outdated_exchanges.append(exchange.title)

        exchanges_to_process = missing_exchanges.union(set(outdated_exchanges))

        if not exchanges_to_process:
            self.stdout.write(
                self.style.SUCCESS(
                    "All required exchanges are up to date. Skipping download and extraction."
                )
            )
            return
        else:
            if missing_exchanges:
                self.stdout.write(
                    self.style.WARNING(
                        f"Missing exchanges: {', '.join(missing_exchanges)}"
                    )
                )
            if outdated_exchanges:
                self.stdout.write(
                    self.style.WARNING(
                        f"Outdated exchanges (>7 days or None dates): {', '.join(outdated_exchanges)}"
                    )
                )
            self.stdout.write(
                self.style.NOTICE("Proceeding to download and process.")
            )

        url = "https://directlink.icicidirect.com/NewSecurityMaster/SecurityMaster.zip"
        zip_path = Path(settings.MEDIA_ROOT) / "SecurityMaster.zip"
        extracted_path = Path(settings.MEDIA_ROOT) / "extracted"

        try:
            # Ensure media directory exists
            media_root = Path(settings.MEDIA_ROOT)
            media_root.mkdir(parents=True, exist_ok=True)
            self.stdout.write(
                self.style.NOTICE(f"Ensured media directory exists: {media_root}")
            )

            # Remove extracted directory if it exists
            if extracted_path.exists():
                shutil.rmtree(extracted_path)
                self.stdout.write(
                    self.style.WARNING(f"Removed existing directory: {extracted_path}")
                )

            # Download the zip file
            self.stdout.write(self.style.NOTICE(f"Downloading from {url}..."))
            urllib.request.urlretrieve(url, zip_path)
            self.stdout.write(self.style.SUCCESS(f"Downloaded zip to {zip_path}"))

            # Extract the zip file
            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extractall(extracted_path)
                self.stdout.write(
                    self.style.SUCCESS(f"Extracted zip to {extracted_path}")
                )

                # Prepare bulk operations
                exchanges_to_create = []
                exchanges_to_update = []

                for extracted_file in zf.namelist():
                    exchange_title = extracted_file[:3]

                    if exchange_title not in REQUIRED_EXCHANGES:
                        logger.warning(
                            f"Unknown exchange title: {exchange_title}, skipping."
                        )
                        continue

                    if exchange_title not in exchanges_to_process:
                        logger.info(
                            f"Exchange '{exchange_title}' is up to date. Skipping update."
                        )
                        continue

                    exchange_file_path = extracted_path / extracted_file
                    exchange_info = REQUIRED_EXCHANGES[exchange_title]

                    exchange_qs = Exchanges.objects.filter(title=exchange_title)

                    if exchange_qs.exists():
                        # Prepare for bulk update
                        exchange = exchange_qs.first()
                        # Convert Path to Django File object
                        with open(exchange_file_path, 'rb') as f:
                            django_file = File(f, name=extracted_file)
                            exchange.file.save(extracted_file, django_file, save=False)
                        # Clear existing instruments for this exchange since we're reprocessing
                        Instrument.objects.filter(exchange=exchange).delete()
                        self.stdout.write(
                            self.style.WARNING(
                                f"Cleared existing instruments for exchange: {exchange_title}"
                            )
                        )
                        exchanges_to_update.append(exchange)
                    else:
                        # Create new exchange and save file properly
                        new_exchange = Exchanges(
                            title=exchange_title,
                            code=exchange_info["code"],
                            exchange=exchange_info["exchange"],
                            is_option=exchange_info.get("is_option", False),
                        )
                        # Save the exchange first to get an ID
                        new_exchange.save()
                        # Then save the file
                        with open(exchange_file_path, 'rb') as f:
                            django_file = File(f, name=extracted_file)
                            new_exchange.file.save(extracted_file, django_file, save=True)
                        
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Created new Exchange entry for: {exchange_title}"
                            )
                        )

                # Bulk update existing exchanges (save them after file operations)
                if exchanges_to_update:
                    with transaction.atomic():
                        for exchange in exchanges_to_update:
                            exchange.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Updated {len(exchanges_to_update)} existing Exchange entries."
                        )
                    )

            # Clean up
            zip_path.unlink()
            self.stdout.write(self.style.SUCCESS(f"Removed zip file: {zip_path}"))

        except Exception as e:
            logger.error("Error processing exchanges", exc_info=True)
            self.stderr.write(self.style.ERROR(f"Error processing exchanges: {e}"))
            raise CommandError(f"Error processing exchanges: {e}") from e

    def process_instruments(self):
        """
        Loads instrument data for each exchange if no instruments exist for that exchange
        or if the exchange was recently updated.
        """
        exchanges = Exchanges.objects.filter(title__in=REQUIRED_EXCHANGES.keys())

        for ins in exchanges:
            self.stdout.write(
                self.style.NOTICE(
                    f"Processing instruments for Exchange: {ins.title} (ID: {ins.id})"
                )
            )

            # Check if Instruments already exist for this exchange and exchange is not recently updated
            if Instrument.objects.filter(exchange=ins).exists() and not self.needs_reprocessing(ins):
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Instruments for Exchange '{ins.title}' already exist and are up to date. Skipping data loading."
                    )
                )
                continue

            try:
                per, created = Percentage.objects.get_or_create(source=ins.title)

                # Pre-fetch existing instruments tokens for quick lookup
                existing_tokens = set(
                    Instrument.objects.filter(exchange=ins).values_list(
                        "token", flat=True
                    )
                )

                file_path = ins.file.path

                if not Path(file_path).exists():
                    self.stdout.write(
                        self.style.ERROR(
                            f"File does not exist: {file_path}. Skipping this exchange."
                        )
                    )
                    continue

                ins_list = []
                line_count = 0

                with Path(file_path).open(encoding="utf-8") as f:
                    reader = csv.reader(f)
                    next(reader, None)  # Skip header

                    for index, data in enumerate(
                        reader, start=2
                    ):  # Start at 2 considering header
                        if len(data) < 7:
                            logger.warning(f"Skipping malformed line {index}: {data}")
                            continue

                        token = data[0].strip()
                        short_name = data[1].strip()

                        if token in existing_tokens:
                            continue

                        try:
                            if ins.is_option:
                                expiry_date = (
                                    datetime.strptime(data[4], "%d-%b-%Y").date()
                                    if data[4]
                                    else None
                                )
                                strike_price = float(data[5]) if data[5] else 0.0
                                instrument = Instrument(
                                    exchange=ins,
                                    stock_token=f"{ins.code}.1!{token}",
                                    token=token,
                                    instrument=data[1].strip(),
                                    short_name=short_name,
                                    series=data[3].strip(),
                                    company_name=data[3].strip(),
                                    expiry=expiry_date,
                                    strike_price=strike_price,
                                    option_type=data[6].strip(),
                                    exchange_code=data[-1].strip(),
                                )
                            else:
                                instrument = Instrument(
                                    exchange=ins,
                                    stock_token=f"{ins.code}.1!{token}",
                                    token=token,
                                    short_name=short_name,
                                    series=data[2].strip(),
                                    company_name=data[3].strip(),
                                    exchange_code=data[-1].strip(),
                                )

                            ins_list.append(instrument)
                            line_count += 1

                            if len(ins_list) >= CHUNK_SIZE:
                                Instrument.objects.bulk_create(
                                    ins_list, ignore_conflicts=True
                                )
                                ins_list.clear()
                                # Update progress
                                per.value = (
                                    index / 100000
                                ) * 100  # Adjust denominator as needed based on total lines
                                per.save()

                        except Exception as e:
                            logger.error(
                                f"Error processing line {index}: {e}", exc_info=True
                            )

                # Bulk create any remaining instruments
                if ins_list:
                    Instrument.objects.bulk_create(ins_list, ignore_conflicts=True)

                # Final progress update
                per.value = 100
                per.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Data loading for Exchange '{ins.title}' completed successfully. Inserted {line_count} instruments."
                    )
                )

            except Exception as e:
                logger.error(
                    f"An unexpected error occurred while loading instruments for Exchange '{ins.title}': {e}",
                    exc_info=True,
                )
                self.stderr.write(
                    self.style.ERROR(
                        f"An unexpected error occurred while loading instruments for Exchange '{ins.title}': {e}"
                    )
                )
