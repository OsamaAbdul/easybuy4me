import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Amaka O.',
        role: 'Busy Parent',
        image: '/avatar_f1.png',
        quote: "Saved me 5 hours this week on grocery runs. The runner even helped carry the bags in! Absolute lifesaver for our family.",
    },
    {
        name: 'Tunde A.',
        role: 'Project Manager',
        image: '/avatar_m1.png',
        quote: 'Used EasyBuy4Me to deliver important documents across Lagos. Fast, secure, and the real-time tracking was spot on.',
    },
    {
        name: 'Chioma N.',
        role: 'University Student',
        image: '/avatar_f2.png',
        quote: 'Late night study snack delivery was a lifesaver during finals. Super affordable rates for students too!',
    },
    {
        name: 'Emeka J.',
        role: 'Business Owner',
        image: '/avatar_m2.png',
        quote: 'Procured international office supplies that I couldn\'t find anywhere in the city. Professional and efficient service.',
    },
    {
        name: 'Sarah K.',
        role: 'Expat in Lagos',
        image: '/avatar_f1.png',
        quote: "Reliable errand runners who actually understand quality. I don't do my market shopping without them anymore.",
    },
    {
        name: 'Ibrahim L.',
        role: 'Tech Consultant',
        image: '/avatar_m1.png',
        quote: 'The level of professionalism from the runners is unmatched. It feels like having a personal assistant on demand.',
    },
    {
        name: 'Blessing E.',
        role: 'Fashion Designer',
        image: '/avatar_f2.png',
        quote: 'Sending fabric and picking up finished pieces from tailors has never been easier. My business moves faster now.',
    },
    {
        name: 'David W.',
        role: 'Hospitality Manager',
        image: '/avatar_m2.png',
        quote: 'Great for bulk purchases for our events. They handle the heavy lifting while I focus on the clients.',
    },
    {
        name: 'Fatima Z.',
        role: 'Home Maker',
        image: '/avatar_f1.png',
        quote: 'I love how I can just send a list on WhatsApp and everything arrives exactly as I wanted. So convenient!',
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

export const Testimonials = () => {
    return (
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-[1024px] mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500 text-xs font-bold mb-8 uppercase tracking-widest"
                    >
                        Wall of Love
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-[#1A1C1E]">
                        Trusted by thousands of <br />
                        <span className="text-gray-400">Nigerians everyday.</span>
                    </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonialChunks.map((chunk, chunkIndex) => (
                        <div key={chunkIndex} className="space-y-4">
                            {chunk.map(({ name, role, quote, image }, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: (chunkIndex * 0.2) + (index * 0.1) }}
                                >
                                    <Card className="border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-4 pt-6">
                                            <Avatar className="size-12 ring-2 ring-gray-50">
                                                <AvatarImage alt={name} src={image} loading="lazy" />
                                                <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold">
                                                    {name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-bold text-[#1A1C1E]">{name}</h3>
                                                <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-3">
                                                    {role}
                                                </span>

                                                <blockquote className="mt-1">
                                                    <p className="text-gray-600 text-sm leading-relaxed">"{quote}"</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
