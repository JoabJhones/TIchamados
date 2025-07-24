
'use client';

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getKnowledgeArticles, listenToKnowledgeArticles } from "@/lib/mock-data";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import type { KnowledgeArticle } from "@/lib/types";
import { CreateKnowledgeArticleForm } from "@/components/knowledge-base/create-article-form";
import { Separator } from "@/components/ui/separator";

export default function KnowledgeBasePage() {
    const { user } = useAuth();
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
     const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = listenToKnowledgeArticles((newArticles) => {
            setArticles(newArticles);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Base de Conhecimento
        </h2>
        <p className="text-muted-foreground">
            Encontre artigos e tutoriais para resolver seus problemas rapidamente.
        </p>
      </div>

       {user?.role === 'admin' && (
        <>
            <div id="new">
             <CreateKnowledgeArticleForm />
            </div>
            <Separator className="my-6" />
        </>
      )}

      <div className="relative">
        <Input
          type="search"
          placeholder="Pesquisar artigos..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
       <div className="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle className="font-headline">{article.title}</CardTitle>
              <CardDescription>{article.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{article.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
