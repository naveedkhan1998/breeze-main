import { useState } from "react";
import { Button, Card, TextInput, Textarea, Alert } from "flowbite-react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulating an API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="p-8 space-y-8">
            <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Get in Touch</h1>
            <p className="text-center text-gray-600 dark:text-gray-400">
              We'd love to hear from you! Whether you have a question, feedback, or a project idea, feel free to reach out to us using the contact details below or by filling out the form.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="p-6 bg-gray-50 dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">nkhan364@uwo.ca</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">+1 (226) 236-7245</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">London, Ontario, Canada</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-gray-50 dark:bg-gray-800">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Name
                    </label>
                    <TextInput id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Email
                    </label>
                    <TextInput id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Message
                    </label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Your message here..." required rows={4} />
                  </div>
                  <Button type="submit" gradientDuoTone="cyanToBlue" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {submitStatus && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Alert color={submitStatus === "success" ? "success" : "failure"} onDismiss={() => setSubmitStatus(null)}>
                  {submitStatus === "success" ? "Message sent successfully!" : "Failed to send message. Please try again."}
                </Alert>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContactPage;
