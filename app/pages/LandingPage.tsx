"use client";

import React, { useContext } from "react";
import { RouterContext } from "@/app/components/contexts/RouterContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, Brain, Lock } from "lucide-react";

/**
 * LandingPage - Uses Elysia's CSS variable system
 * Applied to: landing, auth, and all custom components
 */
export default function LandingPage() {
  const { changePage } = useContext(RouterContext);

  return (
    <div className="min-h-screen bg-background text-primary fade-in flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-background_alt">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center">
            <span className="text-background font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-bold text-primary">Elysia</span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => changePage("login")}
            className="border-border text-primary hover:bg-foreground_alt"
          >
            Sign In
          </Button>
          <Button
            onClick={() => changePage("login")}
            className="bg-accent hover:bg-highlight text-background"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="text-center max-w-3xl mb-12 fade-in">
          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-accent/50 bg-background_accent/50">
            <span className="text-accent text-sm font-medium">Personal Agentic RAG Platform</span>
          </div>
          <h1 className="text-5xl font-bold text-primary mb-4">
            Your Data. Your AI. Your Way.
          </h1>
          <p className="text-xl text-secondary mb-4">
            Elysia is a personal agentic RAG platform designed for privacy-first organizations and enterprises. Deploy locally, control everything, scale infinitely.
          </p>
          <p className="text-sm text-secondary/80 mb-8">
            Built for founders, enterprises, and teams who refuse to compromise on data privacy and control.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-accent hover:bg-highlight text-background"
              onClick={() => changePage("login")}
            >
              Try Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-primary hover:bg-foreground_alt"
              onClick={() => window.open("https://t.me/gingerale0x?text=Hi%2C%20I%20have%20a%20question%20about%20Elysia", "_blank")}
            >
              Contact Sales
            </Button>
          </div>
        </div>

        {/* Technical Differentiators */}
        <div className="mt-20 max-w-4xl fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-6 rounded-lg border border-border bg-background_alt/50">
              <div className="text-2xl font-bold text-accent mb-2">100%</div>
              <p className="text-secondary text-sm">Data Privacy - Local First</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background_alt/50">
              <div className="text-2xl font-bold text-highlight mb-2">∞</div>
              <p className="text-secondary text-sm">Scalability - Your Infrastructure</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background_alt/50">
              <div className="text-2xl font-bold text-alt_color_b mb-2">Granular</div>
              <p className="text-secondary text-sm">RBAC - Per-User Control</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-16 fade-in">
          <Card className="bg-foreground border-border hover:border-accent transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-background_accent flex items-center justify-center mb-3">
                <Lock className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-primary">Local-First Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-secondary">
                Deploy on your infrastructure. Your data never leaves your control. True privacy and compliance by design.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-foreground border-border hover:border-highlight transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-background_accent flex items-center justify-center mb-3">
                <Brain className="h-6 w-6 text-highlight" />
              </div>
              <CardTitle className="text-primary">Personal Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-secondary">
                Agentic RAG with per-user customization. Each team member gets an AI assistant tailored to their role and permissions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-foreground border-border hover:border-alt_color_b transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-background_accent flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-alt_color_b" />
              </div>
              <CardTitle className="text-primary">Enterprise RBAC</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-secondary">
                Fine-grained role-based access control. Manage data permissions at scale without complexity.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases Section */}
        <div className="mt-24 max-w-4xl fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Perfect For</h2>
            <p className="text-secondary">Built for teams who need control, privacy, and scalability</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-foreground border-border">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Enterprises</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-secondary">
                  Multi-tenant deployments with granular RBAC. Compliance-ready with audit trails and data governance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-foreground border-border">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Whitelabel Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-secondary">
                  Embed Elysia into your product. White-labeled interface, your branding, full control.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-foreground border-border">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Privacy-Focused Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-secondary">
                  Local deployment options. Zero data sent to third parties. Your infrastructure, your rules.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-foreground border-border">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Developers & Startups</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-secondary">
                  Open-source components, REST API, and extensible architecture. Build on top of Elysia.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center fade-in">
          <div className="mb-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-3">Ready to Take Control?</h2>
            <p className="text-secondary mb-6">
              Join teams building the future of AI with data privacy and control at the core. No vendor lock-in. No compromises.
            </p>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-accent hover:bg-highlight text-background"
              onClick={() => changePage("login")}
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-primary hover:bg-foreground_alt"
              onClick={() => window.open("https://t.me/gingerale0x?text=Hi%2C%20I%20want%20to%20learn%20about%20whitelabel%20options%20for%20Elysia", "_blank")}
            >
              Explore Whitelabel
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 fade-in bg-background_alt mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <p className="text-secondary text-sm">
            © 2025 Elysia. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-secondary hover:text-primary text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-secondary hover:text-primary text-sm transition-colors">
              Terms
            </a>
            <a href="#" className="text-secondary hover:text-primary text-sm transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

