import React, { useEffect, useState } from 'react';
import { MessageCircleQuestion, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { faqCategories, faqData, getQuestionsByCategory, FAQItem } from '@/data/faqData';

export const FAQ_OPEN_EVENT = 'faq:open';

const FAQCustomerService: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener(FAQ_OPEN_EVENT, handler);
    return () => window.removeEventListener(FAQ_OPEN_EVENT, handler);
  }, []);

  const displayedQuestions: FAQItem[] =
    selectedCategory === 'all'
      ? faqData
      : getQuestionsByCategory(selectedCategory);

  const getCategoryName = (categoryId: string): string => {
    const category = faqCategories.find(c => c.id === categoryId);
    return category ? `${category.icon} ${category.name}` : '';
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>

      {/* FAQ Panel - adjusted for mobile */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-32px)] md:w-[400px] max-w-[400px] h-[calc(100vh-180px)] md:h-[600px] max-h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">常见问题</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Selector */}
          <div className="px-4 py-3 border-b border-border">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择问题分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📋 全部问题 ({faqData.length})</SelectItem>
                {faqCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name} ({getQuestionsByCategory(category.id).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Questions List */}
          <ScrollArea className="flex-1 px-4">
            <Accordion type="single" collapsible className="w-full py-2">
              {displayedQuestions.map((item) => (
                <AccordionItem 
                  key={item.id} 
                  value={`item-${item.id}`}
                  className="border-b border-border/50"
                >
                  <AccordionTrigger className="text-left text-sm hover:no-underline py-3">
                    <div className="flex items-start gap-2 pr-2">
                      <span className="text-primary font-medium shrink-0">Q{item.id}.</span>
                      <span className="text-foreground">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    <div className="pl-7 pr-2 leading-relaxed">
                      {item.answer}
                    </div>
                    <div className="pl-7 mt-2">
                      <span className="text-xs text-muted-foreground/60">
                        {getCategoryName(item.category)}
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              共 {displayedQuestions.length} 个问题 · 点击问题查看答案
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FAQCustomerService;
