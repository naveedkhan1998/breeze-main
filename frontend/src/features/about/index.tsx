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
          Full-stack Developer | Django, Svelte, React | Building end-to-end
          systems
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
                    Full-stack Software Developer
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4 sm:justify-start">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <HiMap className="w-4 h-4" /> Srinagar, Kashmir / London,
                      ON
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <HiPhone className="w-4 h-4" /> [Phone Redacted]
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <HiMail className="w-4 h-4" /> [Email Redacted]
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
                I’m a Full-stack Developer with experience across backend,
                frontend, and infrastructure. My career started with
                backend-heavy work in Django, but over time I’ve grown into
                full-stack roles spanning React, Svelte, and cloud-native
                tooling. I enjoy building structured, scalable systems with an
                eye for performance and developer experience. Currently wrapping
                up my MEng at Western University, I’m working part-time at
                Cypienta leading major features end-to-end in both their Django
                and Svelte stacks.
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
                    Python, JavaScript/TypeScript, SQL, Bash, C++, Java
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Frameworks</h3>
                  <p className="text-muted-foreground">
                    Django, DRF, FastAPI, React, Next.js, SvelteKit
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Databases</h3>
                  <p className="text-muted-foreground">
                    PostgreSQL, Redis, SQLite, MySQL
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Dev & Infra</h3>
                  <p className="text-muted-foreground">
                    Docker, Kubernetes, Celery, GitHub Actions, AWS CDK, Helm,
                    GCP
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
                  Cypienta | Jan 2025 - Present
                </p>
                <ul className="pl-5 space-y-1 list-disc text-muted-foreground">
                  <li>
                    Own full-stack development across Django and Svelte
                    codebases
                  </li>
                  <li>
                    Led architecture refactors: Vite migration, Celery queues,
                    UI audits
                  </li>
                  <li>
                    Handled Kubernetes-based deployments on AWS and Minikube
                  </li>
                  <li>
                    Implemented analytics, AG-Event mapping, and LLM-based
                    integrations
                  </li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold">Backend Engineer</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  GenioBITS Technologies | Jun 2022 - Mar 2023
                </p>
                <ul className="pl-5 space-y-1 list-disc text-muted-foreground">
                  <li>
                    Built scalable modules for trading strategy backtesting
                  </li>
                  <li>
                    Integrated Celery workers and optimized task performance
                  </li>
                  <li>
                    Reduced compute time by 85% through query tuning and caching
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
                  To become a Principal Engineer and build systems that balance
                  performance, simplicity, and innovation — all while staying
                  deeply hands-on with code.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Me?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  I bring strong end-to-end ownership, production experience,
                  and the hunger to improve every day. From database performance
                  to frontend polish — I care about quality across the stack.
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
