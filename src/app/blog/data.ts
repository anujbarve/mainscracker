// Define the type for a single blog post
export interface Post {
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  date: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  tags: string[]; // <-- ADDED
  content: string; // This would typically be Markdown or HTML
}

// Create an array of mock blog posts
export const posts: Post[] = [
  {
    slug: 'mastering-react-hooks',
    title: 'Mastering React Hooks: A Deep Dive into useState and useEffect',
    description: 'Unlock the full potential of functional components in React by mastering the essential Hooks like useState and useEffect.',
    category: 'React',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
    date: 'September 27, 2025',
    author: {
      name: 'Jane Doe',
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    tags: ['react', 'hooks', 'javascript', 'frontend'], // <-- ADDED
    content: `
      <p>React Hooks have revolutionized how we write components. Before Hooks, if you needed to add state to a function component, you had to convert it into a class component. This often led to a complex component hierarchy and made logic reuse difficult.</p>
      <h2>The Power of useState</h2>
      <p>The <strong>useState</strong> hook is the most fundamental hook. It allows you to add state to your functional components with a simple function call. Here's a basic example:</p>
      <pre><code class="language-javascript">
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
      </code></pre>
      <h2>Handling Side Effects with useEffect</h2>
      <p>The <strong>useEffect</strong> hook lets you perform side effects in function components. Data fetching, setting up a subscription, and manually changing the DOM are all examples of side effects. It runs after every render by default, but you can control when it runs by passing a dependency array.</p>
      <p>By understanding these two hooks, you can build powerful and scalable React applications with cleaner, more readable code.</p>
    `,
  },
  {
    slug: 'nextjs-14-features',
    title: 'Exploring the New Features in Next.js 14',
    description: 'A look at the latest updates in Next.js 14, including server actions, partial prerendering, and more.',
    category: 'Next.js',
    imageUrl: 'https://images.unsplash.com/photo-1657214059212-8021873b8c22?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1772&q=80',
    date: 'September 22, 2025',
    author: {
      name: 'John Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    },
    tags: ['nextjs', 'server components', 'performance'], // <-- ADDED
    content: '<p>Content for Next.js 14 features...</p>',
  },
  {
    slug: 'tailwind-css-pro-tips',
    title: '5 Pro Tips for Writing Cleaner Tailwind CSS',
    description: 'Elevate your Tailwind CSS skills with these five practical tips for more maintainable and readable utility-first code.',
    category: 'CSS',
    imageUrl: 'https://images.unsplash.com/photo-1618022039365-175a18a9df44?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
    date: 'September 20, 2025',
    author: {
      name: 'Emily White',
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    },
    tags: ['tailwindcss', 'css', 'design', 'utility-first'], // <-- ADDED
    content: '<p>Content for Tailwind CSS pro tips...</p>',
  },
  {
    slug: 'shadcn-ui-deep-dive',
    title: 'Why Shadcn UI is a Game-Changer for Developers',
    description: 'An in-depth look at how Shadcn UI combines Radix UI and Tailwind CSS to create a flexible and beautiful component library.',
    category: 'UI/UX',
    imageUrl: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80',
    date: 'September 18, 2025',
    author: {
      name: 'Michael Brown',
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    },
    tags: ['shadcn-ui', 'design systems', 'react', 'ui'], // <-- ADDED
    content: '<p>Content for Shadcn UI deep dive...</p>',
  },
];