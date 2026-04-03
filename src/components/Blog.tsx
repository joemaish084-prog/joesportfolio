import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, ChevronDown, ChevronUp, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  meta_description: string;
  content: string;
  topic: string;
  read_time: number;
  created_at: string;
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error && data) {
      setPosts(data as BlogPost[]);
    }
    setLoading(false);
  };

  const generatePost = async () => {
    setGenerating(true);
    try {
      const response = await supabase.functions.invoke("generate-blog-post");
      if (response.error) throw response.error;
      toast({ title: "✅ New blog post generated!", description: response.data?.title });
      await fetchPosts();
    } catch (e) {
      toast({ title: "Error generating post", variant: "destructive" });
    }
    setGenerating(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section id="blog" className="py-20 sm:py-28 px-4 sm:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <BookOpen className="w-3 h-3 mr-1" />
              Blog
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Digital Marketing Insights
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Fresh tips and strategies for growing your brand online
            </p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardHeader className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <ScrollReveal direction="up">
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">No blog posts yet. Generate the first one!</p>
              <Button
                variant="gradient"
                onClick={generatePost}
                disabled={generating}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {generating ? "Generating..." : "Generate First Post"}
              </Button>
            </div>
          </ScrollReveal>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <ScrollReveal key={post.id} direction="up" delay={index * 0.15}>
                  <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-elegant)] h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          {post.topic}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] gap-1 bg-muted text-muted-foreground">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI Generated
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2">
                        {post.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between pt-0">
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.meta_description}
                      </p>

                      {expandedPost === post.id && (
                        <div className="prose prose-sm prose-invert max-w-none mb-4 text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
                          {post.content}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{formatDate(post.created_at)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.read_time} min read
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() =>
                            setExpandedPost(expandedPost === post.id ? null : post.id)
                          }
                        >
                          {expandedPost === post.id ? (
                            <>
                              Show Less <ChevronUp className="w-4 h-4 ml-1" />
                            </>
                          ) : (
                            <>
                              Read More <ChevronDown className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="up" delay={0.3}>
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={generatePost}
                  disabled={generating}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
                  {generating ? "Generating..." : "Generate New Post"}
                </Button>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </section>
  );
}
