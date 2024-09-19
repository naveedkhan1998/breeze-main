import { Card, Badge } from "flowbite-react";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa6";
import { HiMail, HiMap, HiPhone } from "react-icons/hi";

const AboutPage = () => {
  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Naveed Khan</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Full-stack Developer</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2 sm:justify-start">
                  <Badge icon={HiMap} color="indigo">
                    London, ON
                  </Badge>
                  <Badge icon={HiPhone} color="indigo">
                    +1(226) 236-7245
                  </Badge>
                  <Badge icon={HiMail} color="indigo">
                    nkhan364@uwo.ca
                  </Badge>
                  <Badge icon={FaLinkedin} color="indigo">
                    <a href="https://www.linkedin.com/in/mnk1998/" target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Badge>
                  <Badge icon={FaGithub} color="indigo">
                    <a href="https://www.mnaveedk.com" target="_blank" rel="noopener noreferrer">
                      Portfolio
                    </a>
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-gray-50 dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">About Me</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  As a Full-stack Developer with extensive experience in back-end engineering and a strong foundation in front-end technologies, I excel in tasks ranging from requirements analysis and
                  project evaluation to implementation and debugging. I collaborate closely with fellow engineers to build robust applications, optimize performance, and enhance user engagement. I
                  prioritize enhancing my communication and collaboration skills, recognizing their pivotal role in achieving success.
                </p>
              </Card>

              <Card className="p-6 bg-gray-50 dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Skills</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Languages</h3>
                    <p className="text-gray-700 dark:text-gray-300">C, C++, Java, Python, JavaScript/TypeScript</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Frameworks</h3>
                    <p className="text-gray-700 dark:text-gray-300">Django, Fast API, Flask, Spring, Express, React, Next.js, Angular, Vue</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Databases</h3>
                    <p className="text-gray-700 dark:text-gray-300">MySQL, PostgreSQL, MongoDB, Redis</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Other Skills</h3>
                    <p className="text-gray-700 dark:text-gray-300">Git, Docker, Docker Compose, GitHub Actions, AWS, GCP</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gray-50 dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Experience</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Full-stack Developer</h3>
                    <p className="text-gray-600 dark:text-gray-400">RiskTec Systems, Toronto, ON | Apr 2024 - Present</p>
                    <ul className="pl-5 mt-2 text-gray-700 list-disc dark:text-gray-300">
                      <li>Facilitated meetings with stakeholders to discuss the data model, ensuring the application's database strictly adhered to it.</li>
                      <li>Developed backend APIs following best RESTful practices, and during PRs, ensured all developers adhered to these best practices.</li>
                      <li>Implemented trade logic to ensure all relevant tables are correctly updated upon the execution of a ticket.</li>
                      <li>Led the implementation of a comprehensive and dynamic mandate check logic for pre-trade tickets.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Back-end Engineer</h3>
                    <p className="text-gray-600 dark:text-gray-400">GenioBITS Technologies, Pune, MH | Jun 2022 - Mar 2023</p>
                    <ul className="pl-5 mt-2 text-gray-700 list-disc dark:text-gray-300">
                      <li>Enhanced the backtesting module by adding a feature to dynamically link different parameters using AND/OR grouping, making backtesting more comprehensive.</li>
                      <li>
                        Led the development of a strategy optimization module, allowing users to input ranges and options, generating all possible strategy combinations, and running backtests on them.
                      </li>
                      <li>Set up Celery and Celery Beat for running asynchronous tasks and scheduled cron jobs.</li>
                      <li>Identified and resolved blocking queries in the backtesting process, creating a custom caching solution that reduced backtesting time by 85%.</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gray-50 dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">My Mission</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Striving to deliver cutting-edge web solutions that not only meet but exceed my clients' expectations. We're not just building websites; we're crafting digital experiences that leave
                  a lasting impact.
                </p>
              </Card>

              <Card className="p-6 bg-gray-50 dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Why Choose Us?</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We stand out through a perfect blend of creativity and collaboration. Your ideas are not just heard; they are transformed into reality with precision and care, ensuring a seamless
                  and memorable digital journey.
                </p>
              </Card>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AboutPage;
