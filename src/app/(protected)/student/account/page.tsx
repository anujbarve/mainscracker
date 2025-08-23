import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from "@/components/ui/card"

export default function Page() {
    return (
        <div>
            <Card className="">
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                    <p>Card Content</p>
                    <p>Card Content</p>
                    <p>Card Content</p>
                    <p>Card Content</p>
                    <p>Card Content</p>
                    <p>Card Content</p>
                    <p>Card Content</p>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </Card>
        </div>
    )
}
