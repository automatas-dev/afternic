import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {getCurrentTabUId} from "@/utils";
import {ChromeMessage, Sender} from "@/types";

const FormSchema = z.object({
    domains: z.string()
        .min(1, { message: "Please enter at least one domain." })
        .refine(
            (value) => {
                const lines = value.split('\n');
                return lines.length <= 500 && lines.every(line => /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(line.trim()));
            },
            {
                message: "Please enter up to 500 valid domain names, one per line.",
            }
        ),
});

function App() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            domains: "",
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const domainList = data.domains.split('\n').map(domain => domain.trim());
        console.log(domainList);

        const message: ChromeMessage = {
            from: Sender.React,
            message: "Submit",
            data: {
                domains: domainList,
            }
        };

        getCurrentTabUId((id) => {
            if (id) {
                chrome.tabs.sendMessage(id, message, (responseFromContentScript) => {
                    console.log(responseFromContentScript);
                });
            }
        });
    }

    return (
        <div className="p-4 w-full max-w-[800px] mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                    <FormField
                        control={form.control}
                        name="domains"
                        render={({field}) => (
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
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full">Submit</Button>
                </form>
            </Form>
        </div>
    );
}

export default App;