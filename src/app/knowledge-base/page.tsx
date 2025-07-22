import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getKnowledgeArticles } from "@/lib/mock-data";

export default function KnowledgeBasePage() {
    const articles = getKnowledgeArticles();
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
      <div className="relative">
        <Input
          type="search"
          placeholder="Pesquisar artigos..."
          className="w-full"
        />
      </div>
       <div className="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
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
