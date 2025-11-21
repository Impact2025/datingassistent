"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { User, ShieldCheck, MessageSquarePlus, CalendarHeart } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface OnboardingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: User,
    title: "Stap 1: Je profiel als basis",
    description: "Een sterk profiel is het halve werk. Gebruik de 'Profiel Coach' om je profieltekst te (her)schrijven en je foto's te laten analyseren voor de beste eerste indruk.",
    imageId: "onboarding-profile",
    videoUrl: "https://weareimpact.nl/film/Welkom%20datingassistent.mp4"
  },
  {
    icon: ShieldCheck,
    title: "Stap 2: Welk platform past bij jou?",
    description: "Niet elke app is hetzelfde. Doe de 'Platform Matchmaker' in de 'Profiel Coach'-tab en ontdek welke dating app of site het beste aansluit bij jouw wensen.",
    imageId: "onboarding-matchmaker",
  },
  {
    icon: MessageSquarePlus,
    title: "Stap 3: Het perfecte gesprek",
    description: "Weet je niet hoe je moet beginnen? Het 'Opener Lab' geeft je persoonlijke ijsbrekers. De 'Veiligheidscheck' helpt je om gesprekken met een goed gevoel te voeren.",
    imageId: "onboarding-chat",
  },
  {
    icon: CalendarHeart,
    title: "Stap 4: Plan een geslaagde date",
    description: "Van een origineel idee tot een handige checklist voor je date. De 'Date Planner' helpt je om ontspannen en zelfverzekerd op date te gaan.",
    imageId: "onboarding-date",
  },
];


export function OnboardingModal({ isOpen, onOpenChange, onComplete }: OnboardingModalProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    const updateCurrent = () => setCurrent(api.selectedScrollSnap());
    
    updateCurrent();
    api.on("select", updateCurrent);

    return () => {
      api.off("select", updateCurrent);
    }
  }, [api]);

  const CurrentIcon = SLIDES[current]?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6">
        <DialogHeader className="text-center items-center space-y-2">
            {CurrentIcon && (
              <div className="mb-2 rounded-full bg-primary/20 p-3">
                  <CurrentIcon className="h-6 w-6 text-primary" />
              </div>
            )}
            <DialogTitle className="text-xl sm:text-2xl">Welkom bij je DatingAssistent!</DialogTitle>
            <DialogDescription className="text-sm">Een snelle tour door de belangrijkste features.</DialogDescription>
        </DialogHeader>

        <Carousel setApi={setApi} className="w-full mx-auto">
          <CarouselContent>
            {SLIDES.map((slide, index) => {
              const image = PlaceHolderImages.find(p => p.id === slide.imageId);
              return (
              <CarouselItem key={index}>
                <div className="px-2 text-center">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary max-h-[40vh]">
                    {index === 0 && slide.videoUrl ? (
                        <video
                          src={slide.videoUrl}
                          poster={image?.imageUrl}
                          controls
                          autoPlay
                          muted
                          loop
                          className="h-full w-full object-contain"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                      image && (
                        <Image
                          src={image.imageUrl}
                          alt={image.description}
                          fill
                          data-ai-hint={image.imageHint}
                          className="object-cover"
                        />
                      )
                    )}
                  </div>
                  <h3 className="mt-4 text-base sm:text-lg font-semibold px-2">{slide.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground px-2 leading-relaxed">{slide.description}</p>
                </div>
              </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious className="left-0 sm:-left-4" />
          <CarouselNext className="right-0 sm:-right-4" />
        </Carousel>

        <div className="flex justify-center gap-2 py-2">
            {SLIDES.map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full transition-all ${current === i ? 'w-4 bg-primary' : 'bg-primary/30'}`} />
            ))}
        </div>

        <DialogFooter className="mt-2">
          {current === SLIDES.length -1 ? (
            <Button className="w-full" onClick={onComplete}>Aan de slag!</Button>
          ) : (
            <Button className="w-full" variant="outline" onClick={() => api?.scrollNext()}>Volgende</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
