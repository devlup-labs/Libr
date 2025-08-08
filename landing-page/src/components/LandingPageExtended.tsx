import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Github, Twitter, BookOpen, Shield, Instagram, Linkedin, Mail, PencilLine,Users } from 'lucide-react';
import icon_transparent from "../assets/icon_transparent.png"
import ArchitectureAnimation from './ArchitectureAnimation';

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="pt-20">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
          viewport={{ once: false }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-libr-secondary">
            Protocol Architecture
          </h2>
          {/* <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            LIBR's novel framework combines distributed systems, cryptographic protocols, and 
            consensus mechanisms to achieve censorship resistance with community governance.
          </p> */}
        </motion.div>
        
        {/* <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-libr-accent1 to-libr-accent2 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold text-libr-secondary mb-4">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div> */}
      </div>
      <ArchitectureAnimation />
    </section>
  );
};

const Community: React.FC = () => {
  const stats = [
    { number: "Open Source", label: "MIT Licensed" },
    { number: "Go + libp2p", label: "Technology Stack" },
    // { number: "Research", label: "Academic Project" },
    { number: "2025", label: "Development Year" },
    { number: "Beta", label: "v0.0.1" },
  ];

  return (
    <section id="community" className="py-20 w-screen max-w-none">
      <div className="w-screen max-w-none flex flex-col items-center justify-center">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
          viewport={{ once: false }}
          className="w-full flex flex-col items-center justify-center text-center"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-libr-secondary mb-6">
            Open Source
          </h2>
          <p className="text-xl text-muted-foreground px-8 mb-8">
            libr is an academic research project exploring novel approaches to decentralized 
            forum design. Contribute to the future of censorship-resilient yet moderated communication platforms.
          </p>
          <div className="flex flex-col gap-8 w-full items-center justify-center">
            <div className="flex flex-col gap-6 w-full items-center justify-center mb-4 sm:flex-row sm:gap-6 sm:mb-8 sm:items-center md:justify-between md:p-20 pb-0 pt-0">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1],
                    delay: index * 0.1
                  }}
                  viewport={{ once: false }}
                >
                  <div className="text-3xl font-bold text-libr-secondary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-4 w-full items-center justify-center sm:flex-row sm:gap-4 sm:items-center sm:justify-center">
              <button onClick={() => window.open('https://github.com/devlup-labs/Libr/blob/main/README.md', '_blank')} className="libr-button bg-libr-secondary text-libr-primary flex flex-row items-center w-full max-w-xs mx-auto sm:w-full sm:max-w-xs sm:mx-auto md:w-auto md:max-w-none md:mx-0">
                <Users className="w-5 h-5 mr-3" />
                View Documentation
              </button>
              <button onClick={() => window.open('https://github.com/devlup-labs/Libr', '_blank')} className="flex flex-row items-center libr-button-secondary text-libr-secondary border-xl border-libr-secondary w-full max-w-xs mx-auto sm:w-full sm:max-w-xs sm:mx-auto md:w-auto md:max-w-none md:mx-0">
                <Github className="w-5 h-5 mr-3" />
                View on GitHub
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Roadmap: React.FC = () => {
  const roadmapItems = [
    {
      phase: "Phase 1",
      title: "Research & Design (Jan-Feb 2025)",
      status: "completed",
      items: [
        "Protocol architecture finalization",
        "Distributed systems research", 
        "UML modeling and documentation",
        "Technology stack selection"
      ]
    },
    {
      phase: "Phase 2", 
      title: "Core Development (Mar-Apr 2025)",
      status: "completed",
      items: [
        "Go-based protocol implementation",
        "DHT and consensus integration",
        "Modular node architecture",
        "Cryptographic security layer"
      ]
    },
    {
      phase: "Phase 3",
      title: "Integration & Testing (Current)",
      status: "in-progress",
      items: [
        "End-to-end protocol testing",
        "Performance optimization",
        "Documentation completion",
        "Security validation"
      ]
    },
    {
      phase: "Phase 4",
      title: "Open Source Release (Future)",
      status: "planned", 
      items: [
        "Public repository publication",
        "Community governance setup",
        "Developer documentation",
        "Academic paper publication"
      ]
    }
  ];

  return (
    <section id="roadmap" className="py-20 section-padding bg-muted/30">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
          viewport={{ once: false }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-libr-secondary mb-4">
            Development Roadmap
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our journey to building the most robust and user-friendly decentralized social platform.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.phase}
              className="libr-card p-6"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
                delay: index * 0.1,
              }}
              viewport={{ once: false }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-libr-accent1">{item.phase}</span>
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'completed' ? 'bg-green-500' :
                  item.status === 'in-progress' ? 'bg-libr-accent1 animate-pulse' :
                  'bg-muted'
                }`} />
              </div>
              
              <h3 className="text-lg font-semibold text-libr-secondary mb-4">{item.title}</h3>
              
              <ul className="space-y-2">
                {item.items.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      item.status === 'completed' ? 'text-green-500' :
                      item.status === 'in-progress' ? 'text-libr-accent1' :
                      'text-muted'
                    }`} />
                    {task}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/50 border-t border-border py-12 section-padding">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center">
                <img
                  src={icon_transparent}
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <span className="text-2xl font-bold text-foreground">libr</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Censorship-resilient yet moderated forum framework for free expression.
            </p>
            <div className="flex gap-4">
              <Linkedin onClick={() => window.open('https://www.linkedin.com/company/libr-social/', '_blank')} className="w-5 h-5 hover:text-libr-accent1 cursor-pointer transition-colors text-foreground" />
              <Instagram onClick={() => window.open('https://www.instagram.com/libr.social/', '_blank')} className="w-5 h-5 hover:text-libr-accent1 cursor-pointer transition-colors text-foreground" />
              <Github onClick={() => window.open('https://github.com/devlup-labs/Libr', '_blank')} className="w-5 h-5 hover:text-libr-accent1 cursor-pointer transition-colors text-foreground" />
              <BookOpen onClick={() => window.open('https://github.com/devlup-labs/Libr/blob/main/README.md', '_blank')} className="w-5 h-5 hover:text-libr-accent1 cursor-pointer transition-colors text-foreground" />
              <Mail onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=libr.forum@gmail.com', '_blank')} className="w-5 h-5 hover:text-libr-accent1 cursor-pointer transition-colors text-foreground" />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#features" className="hover:text-libr-accent1 transition-colors">Architecture</a></li>
              <li><a href="#how-it-works" className="hover:text-libr-accent1 transition-colors">Protocol</a></li>
              <li><a href="#technical-modules" className="hover:text-libr-accent1 transition-colors">Modules</a></li>
              <li><a href="https://github.com/devlup-labs/Libr/blob/main/README.md" target='_blank' className="hover:text-libr-accent1 transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Community</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="https://github.com/devlup-labs/Libr" target="_blank" className="hover:text-libr-accent1 transition-colors">GitHub</a></li>
              <li><a href="https://github.com/devlup-labs/Libr/blob/main/README.md" target="_blank" className="hover:text-libr-accent1 transition-colors">Research Paper</a></li>
              <li><a href="#" className="hover:text-libr-accent1 transition-colors">Academic Blog</a></li>
              <li><a href="#" className="hover:text-libr-accent1 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Share Feedback</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Share your experience using libr.
            </p>
            <div className="flex gap-2">
              <button onClick={() => window.open('https://forms.gle/Uchqc6Z49aoJwjvZ9', '_blank')} className="flex flex-row items-center px-4 py-2 rounded-lg libr-button bg-libr-secondary text-libr-primary transition-colors">
                <PencilLine className="w-4 h-4 mr-3" />
                Feedback
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 LIBR Protocol. Open Source Research Project.</p>
        </div>
      </div>
    </footer>
  );
};

export { HowItWorks, Community, Roadmap, Footer };
