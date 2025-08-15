import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Ritika Sharma',
        role: 'UPSC Aspirant – Mains 2024',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
        quote: 'The quick evaluation helped me improve my writing within days. I no longer wait for weeks to get feedback. It’s a game-changer for serious aspirants.',
    },
    {
        name: 'Ashish Rao',
        role: 'Political Science Optional – Mentor',
        image: 'https://randomuser.me/api/portraits/men/23.jpg',
        quote: 'Managing and reviewing answer sheets has never been this efficient. The faculty dashboard keeps everything organized and fast.',
    },
    {
        name: 'Neha Kulkarni',
        role: 'UPSC Aspirant – First Attempt',
        image: 'https://randomuser.me/api/portraits/women/5.jpg',
        quote: 'Loved the clean dashboard and instant notifications. The feedback format is concise and exactly what I needed to track my progress.',
    },
    {
        name: 'Ramesh Tiwari',
        role: 'Founder, CivilEdge Coaching',
        image: 'https://randomuser.me/api/portraits/men/15.jpg',
        quote: 'We integrated this platform into our test series, and the turnaround time has improved drastically. Students love the speed and clarity.',
    },
    {
        name: 'Ananya Desai',
        role: 'Working Professional & UPSC Aspirant',
        image: 'https://randomuser.me/api/portraits/women/11.jpg',
        quote: 'Being a working professional, I needed something efficient. Submitting answers and getting them back in 24 hours is a huge advantage.',
    },
    {
        name: 'Imran Qureshi',
        role: 'Ethics Paper Evaluator',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
        quote: 'The platform helps me focus on quality feedback. The UI is intuitive, and I can filter by topic, date, or student instantly.',
    },
    {
        name: 'Sana Iqbal',
        role: 'UPSC Aspirant – Sociology Optional',
        image: 'https://randomuser.me/api/portraits/women/21.jpg',
        quote: 'Analytics helped me identify that I was consistently scoring low in GS2. That realization alone was worth the subscription.',
    },
    {
        name: 'Rahul Verma',
        role: 'Mentor & Faculty – GS Answer Writing',
        image: 'https://randomuser.me/api/portraits/men/10.jpg',
        quote: 'Instead of messy WhatsApp PDFs and delays, I now use the faculty panel to give structured remarks and evaluate within hours.',
    },
    {
        name: 'Priya Menon',
        role: 'UPSC Test Series Subscriber',
        image: 'https://randomuser.me/api/portraits/women/9.jpg',
        quote: 'Every serious UPSC aspirant should try this. The feedback I received helped me improve my intro-conclusion structure drastically.',
    },
]
const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-title text-3xl font-semibold">Loved by the Community</h2>
                        <p className="text-body mt-6">Harum quae dolore orrupti aut temporibus ariatur.</p>
                    </div>
                    <div className="mt-8 grid gap-3 [--color-card:var(--color-muted)] sm:grid-cols-2 md:mt-12 lg:grid-cols-3 dark:[--color-muted:var(--color-zinc-900)]">
                        {testimonialChunks.map((chunk, chunkIndex) => (
                            <div
                                key={chunkIndex}
                                className="space-y-3 *:border-none *:shadow-none">
                                {chunk.map(({ name, role, quote, image }, index) => (
                                    <Card key={index}>
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                            <Avatar className="size-9">
                                                <AvatarImage
                                                    alt={name}
                                                    src={image}
                                                    loading="lazy"
                                                    width="120"
                                                    height="120"
                                                />
                                                <AvatarFallback>ST</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-medium">{name}</h3>

                                                <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                                <blockquote className="mt-3">
                                                    <p className="text-gray-700 dark:text-gray-300">{quote}</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
