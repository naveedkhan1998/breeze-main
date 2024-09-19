import { Banner } from "flowbite-react";
import { MdAnnouncement } from "react-icons/md";
import { HiX } from "react-icons/hi";

export default function AnnouncementBanner() {
  return (
    <Banner>
      <div className="flex justify-between w-full p-4 border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
        <div className="flex items-center mx-auto">
          <p className="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
            <MdAnnouncement className="w-4 h-4 mr-4" />
            <span className="[&_p]:inline">
              This deployed version is using free services, so the limit for data being fetched is 1 month. To use, input your Breeze API key and secret in the account section, then follow the
              instructions to get the access token.
            </span>
          </p>
        </div>
        <Banner.CollapseButton color="gray" className="text-gray-500 bg-transparent border-0 dark:text-gray-400">
          <HiX className="w-4 h-4" />
        </Banner.CollapseButton>
      </div>
    </Banner>
  );
}
