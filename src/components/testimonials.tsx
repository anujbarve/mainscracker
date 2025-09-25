import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'

// Your Testimonial type definition remains the same
type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

// Your testimonials array remains the same
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

export default function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-title text-3xl font-semibold">Loved by the Community</h2>
                        <p className="text-body mt-6">Harum quae dolore orrupti aut temporibus ariatur.</p>
                    </div>
                </div>
                {/* We are removing the container here to allow the cards to span full-width */}
                <div className="mt-12 flex flex-col items-center justify-center gap-4">
                    <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
                    <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
                </div>
            </div>
        </section>
    )
}