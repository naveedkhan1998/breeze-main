import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { HiMail, HiMap, HiPhone } from 'react-icons/hi';
import {
  PageLayout,
  PageHeader,
  PageSubHeader,
  PageContent,
} from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const AboutPage = () => {
  return (
    <PageLayout
      header={
        <PageHeader>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text">
            About Me
          </span>
        </PageHeader>
      }
      subheader={
        <PageSubHeader>
          Full-stack Developer with a passion for building great software
        </PageSubHeader>
      }
    >
      <PageContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/placeholder.svg" alt="Naveed Khan" />
                  <AvatarFallback>NK</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold">Naveed Khan</h1>
                  <p className="text-lg text-muted-foreground">
                    Full-stack Developer
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4 sm:justify-start">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <HiMap className="w-4 h-4" /> London, ON
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <HiPhone className="w-4 h-4" /> +1(226) 236-7245
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <HiMail className="w-4 h-4" /> nkhan364@uwo.ca
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <FaLinkedin className="w-4 h-4" />
                      <a
                        href="https://www.linkedin.com/in/mnk1998/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </a>
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <FaGithub className="w-4 h-4" />
                      <a
                        href="https://www.mnaveedk.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Portfolio
                      </a>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                As a Full-stack Developer with extensive experience in back-end
                engineering and a strong foundation in front-end technologies, I
                excel in tasks ranging from requirements analysis and project
                evaluation to implementation and debugging. I collaborate
                closely with fellow engineers to build robust applications,
                optimize performance, and enhance user engagement. I prioritize
                enhancing my communication and collaboration skills, recognizing
                their pivotal role in achieving success.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">Languages</h3>
                  <p className="text-muted-foreground">
                    C, C++, Java, Python, JavaScript/TypeScript
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Frameworks</h3>
                  <p className="text-muted-foreground">
                    Django, Fast API, Flask, Spring, Express, React, Next.js,
                    Angular, Vue
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Databases</h3>
                  <p className="text-muted-foreground">
                    MySQL, PostgreSQL, MongoDB, Redis
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Other Skills</h3>
                  <p className="text-muted-foreground">
                    Git, Docker, Docker Compose, GitHub Actions, AWS, GCP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Full-stack Developer</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  RiskTec Systems, Toronto, ON | Apr 2024 - Present
                </p>
                <ul className="pl-5 space-y-1 list-disc text-muted-foreground">
                  <li>
                    Facilitated meetings with stakeholders to discuss the data
                    model, ensuring the application's database strictly adhered
                    to it.
                  </li>
                  <li>
                    Developed backend APIs following best RESTful practices, and
                    during PRs, ensured all developers adhered to these best
                    practices.
                  </li>
                  <li>
                    Implemented trade logic to ensure all relevant tables are
                    correctly updated upon the execution of a ticket.
                  </li>
                  <li>
                    Led the implementation of a comprehensive and dynamic
                    mandate check logic for pre-trade tickets.
                  </li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold">Back-end Engineer</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  GenioBITS Technologies, Pune, MH | Jun 2022 - Mar 2023
                </p>
                <ul className="pl-5 space-y-1 list-disc text-muted-foreground">
                  <li>
                    Enhanced the backtesting module by adding a feature to
                    dynamically link different parameters using AND/OR grouping,
                    making backtesting more comprehensive.
                  </li>
                  <li>
                    Led the development of a strategy optimization module,
                    allowing users to input ranges and options, generating all
                    possible strategy combinations, and running backtests on
                    them.
                  </li>
                  <li>
                    Set up Celery and Celery Beat for running asynchronous tasks
                    and scheduled cron jobs.
                  </li>
                  <li>
                    Identified and resolved blocking queries in the backtesting
                    process, creating a custom caching solution that reduced
                    backtesting time by 85%.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>My Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Striving to deliver cutting-edge web solutions that not only
                  meet but exceed my clients' expectations. We're not just
                  building websites; we're crafting digital experiences that
                  leave a lasting impact.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We stand out through a perfect blend of creativity and
                  collaboration. Your ideas are not just heard; they are
                  transformed into reality with precision and care, ensuring a
                  seamless and memorable digital journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </PageContent>
    </PageLayout>
  );
};

export default AboutPage;
