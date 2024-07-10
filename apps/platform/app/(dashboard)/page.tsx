import { BorderBeam } from "@/components/animation/border-beam";
import { RouterCard } from "@/components/common/router-card";
import {
  AudioLines,
  BookUser,
  Bot,
  CalendarDays,
  Grid3X3,
  CalendarRange,
} from "lucide-react";
import Image from "next/image";
import { GrAnnounce } from "react-icons/gr";
import { LiaReadme } from "react-icons/lia";
import { MdOutlinePoll } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { getSession } from "src/lib/auth";
import { sessionType } from "src/types/session";

const quick_links = [
  {
    href: "/results",
    title: "Results",
    description: "Check your results here.",
    Icon: Grid3X3,
  },
  {
    href: "/syllabus",
    title: "Syllabus",
    description: "Check your syllabus here.",
    Icon: LiaReadme,
  },
  {
    href: "/classroom-availability",
    title: "Classroom Availability",
    description: "Check the availability of classrooms here.",
    Icon: SiGoogleclassroom,
  },
  {
    href: "/attendance",
    title: "Attendance Manager",
    description: "Manage your attendance here.",
    Icon: BookUser,
  },
  {
    href: "/schedules",
    title: "Schedules",
    description: "Check your schedules here.",
    Icon: CalendarDays,
  },
  {
    href: "/misc/calender",
    title: "Academic Calender",
    description: "Check the academic calender here.",
    Icon: CalendarRange,
  },
  {
    title: "Community",
    href: "/community",
    Icon: AudioLines,
    description: "Join the community and interact with your peers.",
  },
  {
    title: "Announcements",
    href: "/announcements",
    Icon: GrAnnounce,
    description: "Check out the latest announcements.",
  },
  {
    title: "Polls",
    href: "/polls",
    Icon: MdOutlinePoll,
    description: "Participate in polls.",
  },
  {
    href: "/chat",
    title: "Chatbot",
    description: "Chat with the college chatbot.(Beta)",
    Icon: Bot,
  },
];

export default async function Dashboard() {
  const session = (await getSession()) as sessionType;

  const quote = await getRandomQuote();
  const gif = await getRandomGif();

  return (
    <>
      <section
        id="hero"
        className="z-10 w-full max-w-7xl max-h-96 relative flex justify-center lg:justify-around items-center py-24 px-4 rounded-lg text-center lg:text-left"
      >
        <div>
          <h2
            className="text-xl md:text-2xl lg:text-4xl font-bold text-neutral-900  whitespace-nowrap"
            data-aos="fade-up"
          >
            {getGreeting()}{" "}
            <span className="text-primary">{session?.user?.firstName}</span>
          </h2>
          <p className="mt-4 text-lg text-gray-700" data-aos="fade-up">
            {quote.content} <br />{" "}
            <span className="text-gray-600 italic"> - {quote.author}</span>
          </p>
        </div>
        <div>
          <Image
            src={gif}
            width={600}
            height={600}
            alt="Random GIF"
            className="max-w-full h-auto max-h-60 w-fit mt-4 rounded-lg hidden lg:block"
            data-aos="fade-up"
            unoptimized
          />
          <p
            className="mt-4 text-xs text-gray-700 italic text-center hidden lg:block"
            data-aos="fade-up"
          >
            Random GIF
          </p>
        </div>
        <BorderBeam />
      </section>
      <section
        id="quick-links"
        className="z-10 w-full max-w-6xl mx-auto relative space-y-4 text-left"
      >
        <h2
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-100"
          data-aos="fade-right"
          data-aos-duration="500"
        >
          Quick Links
        </h2>

        <div className="mb-32 grid  lg:mb-0 lg:w-full mx-auto @5xl:max-w-6xl grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-4 text-left gap-4">
          {quick_links.map((link, i) => (
            <RouterCard
              key={i}
              {...link}
              style={{
                animationDelay: `${i * 500}ms`,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function getGreeting(): string {
  const currentHour = new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Good morning!";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "Good afternoon!";
  } else {
    return "Good evening!";
  }
}

// Random quote generator function
async function getRandomQuote(): Promise<{ content: string; author: string }> {
  try {
    const response = await fetch(
      "https://api.quotable.io/quotes/random?limit=1&maxLength=100"
    );
    const data = await response.json();
    return { content: data[0].content, author: data[0].author };
  } catch (error) {
    console.error("Error fetching quote:", error);
    return {
      content: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
    };
  }
}

interface GiphyResponse {
  data: {
    images: {
      original: {
        url: string;
      };
    };
  };
}

const giphy = {
  baseURL: "https://api.giphy.com/v1/gifs/",
  apiKey: "0UTRbFtkMxAplrohufYco5IY74U8hOes",
  tag: "fail",
  type: "random",
  rating: "pg-13",
};

async function getRandomGif(): Promise<string> {
  const giphyURL = encodeURI(
    `${giphy.baseURL}${giphy.type}?api_key=${giphy.apiKey}&tag=${giphy.tag}&rating=${giphy.rating}`
  );

  try {
    const response = await fetch(giphyURL);
    const data: GiphyResponse = await response.json();
    return data.data.images.original.url;
  } catch (error) {
    console.error("Error fetching GIF:", error);
    return "Error fetching GIF. Please try again later.";
  }
}
