import { Button, Card } from "flowbite-react";

const ContactPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-4xl p-6 mt-8 mb-8 space-y-6 bg-white rounded-md shadow-md dark:bg-gray-800">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">Get in Touch</h1>
        <p className="leading-relaxed text-center text-gray-600 dark:text-gray-400">
          We'd love to hear from you! Whether you have a question, feedback, or a project idea, feel free to reach out to us using the contact details below or by filling out the form.
        </p>
        <div className="space-y-6">
          <Card className="p-6 bg-gray-100 rounded-md shadow-inner dark:bg-gray-700">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Contact Information</h2>
            <p className="mt-3 text-gray-700 dark:text-gray-400">
              <strong>Email:</strong> nkhan364@uwo.ca
              <br />
              <strong>Phone:</strong> +1 (226) 236-7245
              <br />
              <strong>Address:</strong> London, Ontario, Canada
            </p>
          </Card>
          <Card className="p-6 bg-gray-100 rounded-md shadow-inner dark:bg-gray-700">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Send us a Message</h2>
            <p className="mt-3 text-gray-700 dark:text-gray-400">Use the form below to send us a message, and we'll get back to you as soon as possible.</p>
            <form className="mt-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Name</label>
                <input
                  type="text"
                  className="block w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Email</label>
                <input
                  type="email"
                  className="block w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Message</label>
                <textarea
                  className="block w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500"
                  rows={4}
                  required
                ></textarea>
              </div>
              <Button type="submit" gradientDuoTone="cyanToBlue" className="w-full">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default ContactPage;
