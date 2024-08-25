import { Card } from "flowbite-react";

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-4xl p-6 mt-8 mb-8 space-y-6 bg-white rounded-md shadow-md dark:bg-gray-800">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">Welcome to my site</h1>
        <p className="leading-relaxed text-center text-gray-600 dark:text-gray-400">
          At mnaveedk, we're not just a team; we're a family of passionate individuals committed to pushing the boundaries of web development. Our dedication to innovation and excellence sets us
          apart.
        </p>
        <div className="space-y-6">
          <Card className="p-6 bg-gray-100 rounded-md shadow-inner dark:bg-gray-700">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">My Mission</h2>
            <p className="mt-3 text-gray-700 dark:text-gray-400">
              Striving to deliver cutting-edge web solutions that not only meet but exceed my clients' expectations. We're not just building websites; we're crafting digital experiences that leave a
              lasting impact.
            </p>
          </Card>
          <Card className="p-6 bg-gray-100 rounded-md shadow-inner dark:bg-gray-700">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Why Choose Us?</h2>
            <p className="mt-3 text-gray-700 dark:text-gray-400">
              We stand out through a perfect blend of creativity and collaboration. Your ideas are not just heard; they are transformed into reality with precision and care, ensuring a seamless and
              memorable digital journey.
            </p>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default AboutPage;
