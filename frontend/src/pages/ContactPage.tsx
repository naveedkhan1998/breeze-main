import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | "success" | "error">(
    null,
  );

  interface FormData {
    name: string;
    email: string;
    message: string;
  }

  interface ChangeEvent {
    target: {
      name: string;
      value: string;
    };
  }

  const handleChange = (e: ChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContactItem = ({
    icon: Icon,
    text,
    href,
  }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    text: string;
    href?: string;
  }) => (
    <div className="flex items-center space-x-3 text-sm">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      {href ? (
        <a href={href} className="text-muted-foreground hover:text-primary">
          {text}
        </a>
      ) : (
        <span className="text-muted-foreground">{text}</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-background md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground">
            Have a question or project in mind? We'd love to hear from you. Send
            us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Reach out to us through any of these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContactItem
                icon={Mail}
                text="nkhan364@uwo.ca"
                href="mailto:nkhan364@uwo.ca"
              />
              <ContactItem
                icon={Phone}
                text="+1 (226) 236-7245"
                href="tel:+12262367245"
              />
              <ContactItem
                icon={MapPin}
                text="London, Ontario, Canada"
                href={"/"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    required
                    className="min-h-[120px]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
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
            </CardContent>
          </Card>
        </div>

        {submitStatus && (
          <Alert
            variant={submitStatus === "success" ? "default" : "destructive"}
            className={cn(
              "animate-in fade-in-0 slide-in-from-bottom-5",
              submitStatus === "success" ? "bg-green-500/15" : undefined,
            )}
          >
            <AlertDescription>
              {submitStatus === "success"
                ? "Message sent successfully! We'll get back to you soon."
                : "Failed to send message. Please try again."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
