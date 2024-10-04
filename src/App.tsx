import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const FormSchema = z.object({
  domains: z
    .string()
    .min(1, { message: "Please enter at least one domain." })
    .refine(
      (value) => {
        const lines = value.split("\n");
        return (
          lines.length <= 500 &&
          lines.every((line) =>
            /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(line.trim())
          )
        );
      },
      {
        message: "Please enter up to 500 valid domain names, one per line.",
      }
    ),
  delay: z.string().refine((value) => parseInt(value) >= 0, {
    message: "Delay must be a positive number.",
  }),
  deleteDelay: z.string().refine((value) => parseInt(value) >= 0, {
    message: "Delay must be a positive number.",
  }),
});

function App() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      domains: "",
      delay: "5000",
      deleteDelay: "200",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const domainList = data.domains.split("\n").map((domain) => domain.trim());
    await chrome.storage.local.set({ ...data , domains: domainList});

    if (domainList.length)
      window.open("https://www.afternic.com/domains/add", "_blank");
  }

  useEffect(() => {
    chrome.storage.local.get(["domains"], (items) => {
      const domainList = items.domains;
      if (domainList) form.setValue("domains", domainList.join("\n"));
      if (items.delay) form.setValue("delay", items.delay+"");
      if (items.deleteDelay) form.setValue("deleteDelay", items.deleteDelay+"");
    });
  }, []);

  return (
    <div className="p-4 w-full max-w-[800px] mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormField
            control={form.control}
            name="domains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain Names</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter domain names (one per line, up to 500)"
                    {...field}
                    rows={10}
                    className="w-full resize-vertical"
                  />
                </FormControl>
                <FormDescription>
                  Enter up to 500 domain names, one per line.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delay (ms)</FormLabel>
                <FormControl>
                  <input
                    type="number"
                    {...field}
                    className="w-full"
                    placeholder="Delay before submitting"
                  />
                </FormControl>
                <FormDescription>
                  Delay in milliseconds before submitting another 50 domains.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deleteDelay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delete Delay (ms)</FormLabel>
                <FormControl>
                  <input
                    type="number"
                    {...field}
                    className="w-full"
                    placeholder="Delay before deleting"
                  />
                </FormControl>
                <FormDescription>
                  Delay in milliseconds before deleting an invalid domains.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default App;
