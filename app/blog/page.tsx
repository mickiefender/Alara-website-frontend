'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useState } from 'react'
import { Search, Calendar, User, MessageSquare } from 'lucide-react'

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const articles = [
    {
      id: 1,
      title: 'The Future of School Administration',
      excerpt: 'Exploring how technology is reshaping the way schools operate and manage their institutions.',
      category: 'Education Technology',
      author: 'Sarah Johnson',
      date: 'March 15, 2024',
      readTime: '8 min read',
      comments: 12,
      featured: true,
      image: 'linear-gradient(135deg, #008484 0%, #006666 100%)',
    },
    {
      id: 2,
      title: 'Data Privacy in Education: What Schools Need to Know',
      excerpt: 'A comprehensive guide to protecting student data and maintaining compliance with education regulations.',
      category: 'Security',
      author: 'Michael Chen',
      date: 'March 12, 2024',
      readTime: '10 min read',
      comments: 8,
      featured: true,
      image: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
    },
    {
      id: 3,
      title: 'Implementing Digital Learning: Best Practices for Schools',
      excerpt: 'Strategic approaches to integrating digital tools and platforms into your educational institution.',
      category: 'Best Practices',
      author: 'Emma Rodriguez',
      date: 'March 10, 2024',
      readTime: '6 min read',
      comments: 15,
      featured: false,
      image: 'linear-gradient(135deg, #008484 0%, #005C5C 100%)',
    },
    {
      id: 4,
      title: 'Student Success: Measuring What Matters',
      excerpt: 'Using analytics and data-driven insights to identify and support student achievement.',
      category: 'Analytics',
      author: 'David Thompson',
      date: 'March 8, 2024',
      readTime: '7 min read',
      comments: 10,
      featured: false,
      image: 'linear-gradient(135deg, #FF6B35 0%, #FF5C42 100%)',
    },
    {
      id: 5,
      title: 'Building Inclusive Classrooms with Technology',
      excerpt: 'How schools are using technology to create more accessible and inclusive learning environments.',
      category: 'Education Technology',
      author: 'Lisa Wang',
      date: 'March 5, 2024',
      readTime: '9 min read',
      comments: 14,
      featured: false,
      image: 'linear-gradient(135deg, #008484 0%, #007070 100%)',
    },
    {
      id: 6,
      title: 'The Role of Artificial Intelligence in Education',
      excerpt: 'Understanding AI applications in personalized learning, assessment, and administrative efficiency.',
      category: 'Education Technology',
      author: 'James Park',
      date: 'March 1, 2024',
      readTime: '11 min read',
      comments: 22,
      featured: false,
      image: 'linear-gradient(135deg, #FF6B35 0%, #FF7A4D 100%)',
    },
    {
      id: 7,
      title: 'Parent Engagement: Connecting School and Home',
      excerpt: 'Strategies for improving communication and collaboration between schools and families.',
      category: 'Best Practices',
      author: 'Jennifer Martinez',
      date: 'February 28, 2024',
      readTime: '5 min read',
      comments: 9,
      featured: false,
      image: 'linear-gradient(135deg, #008484 0%, #006666 100%)',
    },
    {
      id: 8,
      title: 'Cybersecurity in Schools: Protecting Your Institution',
      excerpt: 'Essential cybersecurity measures every school should implement to protect their digital assets.',
      category: 'Security',
      author: 'Robert Chang',
      date: 'February 25, 2024',
      readTime: '8 min read',
      comments: 11,
      featured: false,
      image: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
    },
    {
      id: 9,
      title: 'Case Study: How Central High Improved Efficiency by 40%',
      excerpt: 'Real-world results from a school that implemented comprehensive management solutions.',
      category: 'Case Studies',
      author: 'Amanda Foster',
      date: 'February 22, 2024',
      readTime: '6 min read',
      comments: 7,
      featured: false,
      image: 'linear-gradient(135deg, #008484 0%, #005C5C 100%)',
    },
  ]

  const categories = [
    'all',
    'Education Technology',
    'Security',
    'Best Practices',
    'Analytics',
    'Case Studies',
  ]

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredArticles = filteredArticles.filter(a => a.featured).slice(0, 2)
  const regularArticles = filteredArticles.filter(a => !a.featured)

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-transparent py-20 md:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Insights & Resources
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Expert perspectives on education technology and school management
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-12 md:py-20 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-semibold transition capitalize ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="py-20 md:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-8 mb-16">
                {featuredArticles.map(article => (
                  <div key={article.id} className="group cursor-pointer">
                    <div
                      className="w-full h-64 rounded-lg mb-4 hover:shadow-lg transition"
                      style={{ background: article.image }}
                    ></div>
                    <div className="space-y-3">
                      <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground">{article.excerpt}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4">
                        <span className="flex items-center gap-1">
                          <User size={16} /> {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={16} /> {article.date}
                        </span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section className="py-20 md:py-32 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {regularArticles.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {regularArticles.map(article => (
                  <div key={article.id} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer">
                    <div
                      className="w-full h-48"
                      style={{ background: article.image }}
                    ></div>
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-semibold mb-3">
                        {article.category}
                      </span>
                      <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                      <div className="space-y-2 border-t border-border pt-4">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User size={14} /> {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={14} /> {article.comments}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> {article.date}
                          </span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No articles found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Stay Updated</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our newsletter for the latest insights on education technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition font-semibold whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your School?</h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Discover how Alara can streamline your operations and enhance student success.
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
              Schedule a Demo
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
