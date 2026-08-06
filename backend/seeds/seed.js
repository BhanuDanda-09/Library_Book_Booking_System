/**
 * Library Management System — Database Seed Script
 * Run: node backend/seeds/seed.js
 *
 * Seeds: 15 categories, 100+ books, 25 users (2 admin), 200+ reservations,
 *        wishlist, notifications, activity logs
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });

const mongoose    = require('mongoose');
const bcrypt      = require('bcryptjs');
const dns         = require('dns');

// Models
const Book        = require('../models/Book');
const User        = require('../models/User');
const Reservation = require('../models/Reservation');
const Category    = require('../models/Category');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// ── Helpers ───────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (d) => new Date(Date.now() - d * 86400000);
const daysFromNow = (d) => new Date(Date.now() + d * 86400000);

// ── CATEGORIES ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Programming',       icon: '💻', color: '#6366f1', description: 'Software development and programming languages' },
  { name: 'Artificial Intelligence', icon: '🤖', color: '#8b5cf6', description: 'AI, neural networks, and cognitive computing' },
  { name: 'Machine Learning',  icon: '🧠', color: '#a855f7', description: 'Statistical learning and predictive modeling' },
  { name: 'Data Science',      icon: '📊', color: '#3b82f6', description: 'Data analysis, visualization, and insights' },
  { name: 'Web Development',   icon: '🌐', color: '#06b6d4', description: 'Frontend, backend, and full-stack web technologies' },
  { name: 'Databases',         icon: '🗄️', color: '#14b8a6', description: 'Database design, SQL, NoSQL, and data modeling' },
  { name: 'Networking',        icon: '🔗', color: '#22c55e', description: 'Computer networks, protocols, and infrastructure' },
  { name: 'Cyber Security',    icon: '🔒', color: '#ef4444', description: 'Information security, ethical hacking, and cryptography' },
  { name: 'Cloud Computing',   icon: '☁️', color: '#f59e0b', description: 'AWS, Azure, GCP, and distributed systems' },
  { name: 'Mathematics',       icon: '📐', color: '#ec4899', description: 'Pure and applied mathematics, statistics' },
  { name: 'Science',           icon: '🔬', color: '#10b981', description: 'Physics, chemistry, biology, and natural sciences' },
  { name: 'Fiction',           icon: '📖', color: '#f97316', description: 'Novels, stories, and imaginative literature' },
  { name: 'Non-Fiction',       icon: '📰', color: '#64748b', description: 'Factual books, biographies, and essays' },
  { name: 'History',           icon: '🏛️', color: '#78716c', description: 'World history, civilizations, and historical events' },
  { name: 'Philosophy',        icon: '🤔', color: '#84cc16', description: 'Ethics, logic, metaphysics, and epistemology' },
];

// ── BOOKS DATA ────────────────────────────────────────────────────────────────
const BOOKS_DATA = [
  // Programming
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0-13-235088-4', category: 'Programming', publisher: 'Prentice Hall', publishedYear: 2008, language: 'English', description: 'A handbook of agile software craftsmanship covering best practices for writing clean, readable, maintainable code.', edition: '1st', shelfLocation: 'A1-01', totalCopies: 5 },
  { title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt', isbn: '978-0-13-595705-9', category: 'Programming', publisher: 'Addison-Wesley', publishedYear: 2019, language: 'English', description: 'Your journey to mastery — a guide to becoming a better programmer.', edition: '2nd', shelfLocation: 'A1-02', totalCopies: 4 },
  { title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0-20-163361-5', category: 'Programming', publisher: 'Addison-Wesley', publishedYear: 1994, language: 'English', description: 'Elements of reusable object-oriented software — the classic patterns book.', edition: '1st', shelfLocation: 'A1-03', totalCopies: 3 },
  { title: 'Refactoring', author: 'Martin Fowler', isbn: '978-0-13-468599-1', category: 'Programming', publisher: 'Addison-Wesley', publishedYear: 2018, language: 'English', description: 'Improving the design of existing code through safe, systematic refactoring.', edition: '2nd', shelfLocation: 'A1-04', totalCopies: 4 },
  { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0-26-204630-5', category: 'Programming', publisher: 'MIT Press', publishedYear: 2009, language: 'English', description: 'The comprehensive textbook on algorithms and data structures.', edition: '3rd', shelfLocation: 'A1-05', totalCopies: 6 },
  { title: 'You Don\'t Know JS', author: 'Kyle Simpson', isbn: '978-1-49-192202-3', category: 'Programming', publisher: "O'Reilly", publishedYear: 2015, language: 'English', description: 'A deep dive into the core mechanisms of JavaScript.', edition: '1st', shelfLocation: 'A1-06', totalCopies: 4 },
  { title: 'The Art of Computer Programming', author: 'Donald Knuth', isbn: '978-0-20-148541-7', category: 'Programming', publisher: 'Addison-Wesley', publishedYear: 2011, language: 'English', description: 'The definitive multi-volume work on fundamental algorithms.', edition: '4th', shelfLocation: 'A1-07', totalCopies: 2 },
  { title: 'Python Crash Course', author: 'Eric Matthes', isbn: '978-1-71-850072-3', category: 'Programming', publisher: 'No Starch Press', publishedYear: 2023, language: 'English', description: 'A hands-on, project-based introduction to Python programming.', edition: '3rd', shelfLocation: 'A1-08', totalCopies: 7 },

  // AI
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', isbn: '978-0-13-604259-4', category: 'Artificial Intelligence', publisher: 'Pearson', publishedYear: 2020, language: 'English', description: 'The definitive textbook on artificial intelligence.', edition: '4th', shelfLocation: 'B1-01', totalCopies: 5 },
  { title: 'Grokking Artificial Intelligence Algorithms', author: 'Rishal Hurbans', isbn: '978-1-61-729463-0', category: 'Artificial Intelligence', publisher: 'Manning', publishedYear: 2020, language: 'English', description: 'An illustrated, friendly guide to AI algorithms.', edition: '1st', shelfLocation: 'B1-02', totalCopies: 4 },
  { title: 'Life 3.0: Being Human in the Age of AI', author: 'Max Tegmark', isbn: '978-1-10-198871-3', category: 'Artificial Intelligence', publisher: 'Knopf', publishedYear: 2017, language: 'English', description: 'Exploring the future of AI and its implications for humanity.', edition: '1st', shelfLocation: 'B1-03', totalCopies: 3 },
  { title: 'Human Compatible', author: 'Stuart Russell', isbn: '978-0-52-555551-5', category: 'Artificial Intelligence', publisher: 'Viking', publishedYear: 2019, language: 'English', description: 'Artificial intelligence and the problem of control.', edition: '1st', shelfLocation: 'B1-04', totalCopies: 3 },

  // Machine Learning
  { title: 'Hands-On Machine Learning', author: 'Aurélien Géron', isbn: '978-1-09-812597-4', category: 'Machine Learning', publisher: "O'Reilly", publishedYear: 2022, language: 'English', description: 'Concepts, tools, and techniques to build intelligent systems with Scikit-Learn and TensorFlow.', edition: '3rd', shelfLocation: 'C1-01', totalCopies: 6 },
  { title: 'Pattern Recognition and Machine Learning', author: 'Christopher Bishop', isbn: '978-0-38-731073-2', category: 'Machine Learning', publisher: 'Springer', publishedYear: 2006, language: 'English', description: 'A comprehensive textbook on pattern recognition and machine learning.', edition: '1st', shelfLocation: 'C1-02', totalCopies: 3 },
  { title: 'Deep Learning', author: 'Ian Goodfellow', isbn: '978-0-26-203561-3', category: 'Machine Learning', publisher: 'MIT Press', publishedYear: 2016, language: 'English', description: 'The foundational textbook on deep learning theory and practice.', edition: '1st', shelfLocation: 'C1-03', totalCopies: 5 },
  { title: 'Machine Learning Yearning', author: 'Andrew Ng', isbn: '978-0-00-000001-0', category: 'Machine Learning', publisher: 'deeplearning.ai', publishedYear: 2018, language: 'English', description: 'Technical strategy for AI engineers — how to structure ML projects.', edition: '1st', shelfLocation: 'C1-04', totalCopies: 4 },
  { title: 'The Hundred-Page Machine Learning Book', author: 'Andriy Burkov', isbn: '978-1-99-998585-6', category: 'Machine Learning', publisher: 'Andriy Burkov', publishedYear: 2019, language: 'English', description: 'A concise, comprehensive guide to machine learning.', edition: '1st', shelfLocation: 'C1-05', totalCopies: 5 },

  // Data Science
  { title: 'Python for Data Analysis', author: 'Wes McKinney', isbn: '978-1-09-181037-9', category: 'Data Science', publisher: "O'Reilly", publishedYear: 2022, language: 'English', description: 'Data wrangling with pandas, NumPy, and Jupyter.', edition: '3rd', shelfLocation: 'D1-01', totalCopies: 6 },
  { title: 'Storytelling with Data', author: 'Cole Nussbaumer Knaflic', isbn: '978-1-11-921225-7', category: 'Data Science', publisher: 'Wiley', publishedYear: 2015, language: 'English', description: 'A data visualization guide for business professionals.', edition: '1st', shelfLocation: 'D1-02', totalCopies: 4 },
  { title: 'Data Science from Scratch', author: 'Joel Grus', isbn: '978-1-49-920142-1', category: 'Data Science', publisher: "O'Reilly", publishedYear: 2019, language: 'English', description: 'First principles with Python — build data science tools from the ground up.', edition: '2nd', shelfLocation: 'D1-03', totalCopies: 5 },
  { title: 'The Data Warehouse Toolkit', author: 'Ralph Kimball, Margy Ross', isbn: '978-1-11-853080-7', category: 'Data Science', publisher: 'Wiley', publishedYear: 2013, language: 'English', description: 'The definitive guide to dimensional modeling for data warehouses.', edition: '3rd', shelfLocation: 'D1-04', totalCopies: 3 },

  // Web Development
  { title: 'HTML and CSS: Design and Build Websites', author: 'Jon Duckett', isbn: '978-1-11-803701-3', category: 'Web Development', publisher: 'Wiley', publishedYear: 2011, language: 'English', description: 'A visually stunning introduction to web design with HTML5 and CSS3.', edition: '1st', shelfLocation: 'E1-01', totalCopies: 8 },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '978-0-59-651774-8', category: 'Web Development', publisher: "O'Reilly", publishedYear: 2008, language: 'English', description: 'The subset of JavaScript that makes it a truly outstanding language.', edition: '1st', shelfLocation: 'E1-02', totalCopies: 5 },
  { title: 'Learning React', author: 'Alex Banks, Eve Porcello', isbn: '978-1-49-205854-0', category: 'Web Development', publisher: "O'Reilly", publishedYear: 2020, language: 'English', description: 'Functional web development with React and Redux.', edition: '2nd', shelfLocation: 'E1-03', totalCopies: 6 },
  { title: 'Node.js Design Patterns', author: 'Mario Casciaro, Luciano Mammino', isbn: '978-1-83-921610-6', category: 'Web Development', publisher: 'Packt', publishedYear: 2020, language: 'English', description: 'Design and implement production-grade Node.js applications.', edition: '3rd', shelfLocation: 'E1-04', totalCopies: 4 },
  { title: 'CSS: The Definitive Guide', author: 'Eric Meyer, Estelle Weyl', isbn: '978-1-09-810050-3', category: 'Web Development', publisher: "O'Reilly", publishedYear: 2022, language: 'English', description: 'Visual presentation of web pages with CSS.', edition: '5th', shelfLocation: 'E1-05', totalCopies: 4 },

  // Databases
  { title: 'Learning SQL', author: 'Alan Beaulieu', isbn: '978-1-49-203248-9', category: 'Databases', publisher: "O'Reilly", publishedYear: 2020, language: 'English', description: 'Master SQL fundamentals — generate, manipulate, and retrieve data.', edition: '3rd', shelfLocation: 'F1-01', totalCopies: 6 },
  { title: 'MongoDB: The Definitive Guide', author: 'Shannon Bradshaw, Eoin Brazil', isbn: '978-1-49-195470-3', category: 'Databases', publisher: "O'Reilly", publishedYear: 2019, language: 'English', description: 'Powerful and scalable data storage with MongoDB.', edition: '3rd', shelfLocation: 'F1-02', totalCopies: 5 },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-1-44-937332-0', category: 'Databases', publisher: "O'Reilly", publishedYear: 2017, language: 'English', description: 'The big ideas behind reliable, scalable, and maintainable systems.', edition: '1st', shelfLocation: 'F1-03', totalCopies: 4 },
  { title: 'PostgreSQL: Up and Running', author: 'Regina Obe, Leo Hsu', isbn: '978-1-49-202319-7', category: 'Databases', publisher: "O'Reilly", publishedYear: 2017, language: 'English', description: 'A practical guide to the advanced open source database.', edition: '3rd', shelfLocation: 'F1-04', totalCopies: 4 },

  // Networking
  { title: 'Computer Networks', author: 'Andrew Tanenbaum', isbn: '978-0-13-212695-3', category: 'Networking', publisher: 'Pearson', publishedYear: 2010, language: 'English', description: 'A top-down approach to understanding computer networks.', edition: '5th', shelfLocation: 'G1-01', totalCopies: 5 },
  { title: 'TCP/IP Illustrated', author: 'W. Richard Stevens', isbn: '978-0-32-163618-4', category: 'Networking', publisher: 'Addison-Wesley', publishedYear: 2011, language: 'English', description: 'The protocols of the internet explained in depth.', edition: '2nd', shelfLocation: 'G1-02', totalCopies: 3 },
  { title: 'Network Security Essentials', author: 'William Stallings', isbn: '978-0-13-452733-9', category: 'Networking', publisher: 'Pearson', publishedYear: 2017, language: 'English', description: 'Applications and standards for network security.', edition: '6th', shelfLocation: 'G1-03', totalCopies: 4 },

  // Cyber Security
  { title: 'The Web Application Hacker\'s Handbook', author: 'Dafydd Stuttard, Marcus Pinto', isbn: '978-1-11-802647-5', category: 'Cyber Security', publisher: 'Wiley', publishedYear: 2011, language: 'English', description: 'Finding and exploiting security flaws in web applications.', edition: '2nd', shelfLocation: 'H1-01', totalCopies: 4 },
  { title: 'Hacking: The Art of Exploitation', author: 'Jon Erickson', isbn: '978-1-59-327144-2', category: 'Cyber Security', publisher: 'No Starch Press', publishedYear: 2008, language: 'English', description: 'Understanding hacking from the ground up.', edition: '2nd', shelfLocation: 'H1-02', totalCopies: 3 },
  { title: 'Cybersecurity Essentials', author: 'Charles Brooks', isbn: '978-1-11-939454-4', category: 'Cyber Security', publisher: 'Wiley', publishedYear: 2018, language: 'English', description: 'An introduction to cybersecurity concepts and practices.', edition: '1st', shelfLocation: 'H1-03', totalCopies: 5 },
  { title: 'Cryptography and Network Security', author: 'William Stallings', isbn: '978-0-13-476326-2', category: 'Cyber Security', publisher: 'Pearson', publishedYear: 2019, language: 'English', description: 'Principles and practice of cryptography and network security.', edition: '8th', shelfLocation: 'H1-04', totalCopies: 4 },

  // Cloud Computing
  { title: 'Cloud Computing: Concepts, Technology & Architecture', author: 'Thomas Erl', isbn: '978-0-13-338752-7', category: 'Cloud Computing', publisher: 'Prentice Hall', publishedYear: 2013, language: 'English', description: 'The comprehensive reference guide to cloud computing.', edition: '1st', shelfLocation: 'I1-01', totalCopies: 4 },
  { title: 'AWS in Action', author: 'Michael Wittig, Andreas Wittig', isbn: '978-1-61-729545-3', category: 'Cloud Computing', publisher: 'Manning', publishedYear: 2018, language: 'English', description: 'A guide to running web applications on Amazon Web Services.', edition: '2nd', shelfLocation: 'I1-02', totalCopies: 5 },
  { title: 'Kubernetes in Action', author: 'Marko Luksa', isbn: '978-1-61-729372-5', category: 'Cloud Computing', publisher: 'Manning', publishedYear: 2018, language: 'English', description: 'Full understanding of Kubernetes orchestration.', edition: '1st', shelfLocation: 'I1-03', totalCopies: 4 },

  // Mathematics
  { title: 'Mathematics for Machine Learning', author: 'Marc Peter Deisenroth', isbn: '978-1-10-847004-9', category: 'Mathematics', publisher: 'Cambridge University Press', publishedYear: 2020, language: 'English', description: 'The mathematical foundations needed for machine learning.', edition: '1st', shelfLocation: 'J1-01', totalCopies: 5 },
  { title: 'Discrete Mathematics and Its Applications', author: 'Kenneth Rosen', isbn: '978-0-07-338309-5', category: 'Mathematics', publisher: 'McGraw-Hill', publishedYear: 2018, language: 'English', description: 'Covers logic, sets, combinatorics, graph theory, and more.', edition: '8th', shelfLocation: 'J1-02', totalCopies: 6 },
  { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', isbn: '978-3-31-911079-4', category: 'Mathematics', publisher: 'Springer', publishedYear: 2015, language: 'English', description: 'A fresh approach to linear algebra — vectors, matrices, and transformations.', edition: '3rd', shelfLocation: 'J1-03', totalCopies: 4 },
  { title: 'Calculus', author: 'James Stewart', isbn: '978-1-28-557095-3', category: 'Mathematics', publisher: 'Cengage', publishedYear: 2015, language: 'English', description: 'Early transcendentals — the gold standard calculus textbook.', edition: '8th', shelfLocation: 'J1-04', totalCopies: 8 },

  // Science
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0-55-305340-1', category: 'Science', publisher: 'Bantam', publishedYear: 1998, language: 'English', description: 'From the Big Bang to black holes — science for everyone.', edition: '10th', shelfLocation: 'K1-01', totalCopies: 6 },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '978-0-19-929114-4', category: 'Science', publisher: 'Oxford University Press', publishedYear: 2006, language: 'English', description: 'A landmark work in evolutionary biology.', edition: '30th', shelfLocation: 'K1-02', totalCopies: 4 },
  { title: 'The Structure of Scientific Revolutions', author: 'Thomas Kuhn', isbn: '978-0-22-645812-0', category: 'Science', publisher: 'University of Chicago Press', publishedYear: 2012, language: 'English', description: 'A landmark work in the philosophy and history of science.', edition: '4th', shelfLocation: 'K1-03', totalCopies: 3 },
  { title: 'Cosmos', author: 'Carl Sagan', isbn: '978-0-34-533992-8', category: 'Science', publisher: 'Ballantine Books', publishedYear: 2013, language: 'English', description: 'A personal voyage through the universe — science and humanity.', edition: 'Anniversary', shelfLocation: 'K1-04', totalCopies: 5 },
  { title: 'The Gene: An Intimate History', author: 'Siddhartha Mukherjee', isbn: '978-1-47-676940-7', category: 'Science', publisher: 'Scribner', publishedYear: 2016, language: 'English', description: 'The definitive history of the gene and genetics.', edition: '1st', shelfLocation: 'K1-05', totalCopies: 4 },

  // Fiction
  { title: '1984', author: 'George Orwell', isbn: '978-0-45-152493-5', category: 'Fiction', publisher: 'Signet Classic', publishedYear: 1977, language: 'English', description: 'A dystopian social science fiction novel set in a totalitarian society.', edition: 'Classic', shelfLocation: 'L1-01', totalCopies: 8 },
  { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', isbn: '978-0-34-539180-3', category: 'Fiction', publisher: 'Del Rey Books', publishedYear: 1995, language: 'English', description: 'A comedic science fiction series about the universe and everything.', edition: 'Classic', shelfLocation: 'L1-02', totalCopies: 6 },
  { title: 'Dune', author: 'Frank Herbert', isbn: '978-0-44-101359-0', category: 'Fiction', publisher: 'Ace Books', publishedYear: 1990, language: 'English', description: 'The epic science fiction masterpiece about desert politics, ecology, and power.', edition: 'Classic', shelfLocation: 'L1-03', totalCopies: 5 },
  { title: 'Ender\'s Game', author: 'Orson Scott Card', isbn: '978-0-81-250533-7', category: 'Fiction', publisher: 'Tor Books', publishedYear: 1994, language: 'English', description: 'A brilliant child trains to become a military commander in a futuristic world.', edition: 'Revised', shelfLocation: 'L1-04', totalCopies: 6 },
  { title: 'The Martian', author: 'Andy Weir', isbn: '978-0-80-413902-1', category: 'Fiction', publisher: 'Crown', publishedYear: 2014, language: 'English', description: 'An astronaut stranded on Mars must survive using science and ingenuity.', edition: '1st', shelfLocation: 'L1-05', totalCopies: 7 },
  { title: 'Brave New World', author: 'Aldous Huxley', isbn: '978-0-06-085052-4', category: 'Fiction', publisher: 'Harper Perennial', publishedYear: 2006, language: 'English', description: 'A dystopian novel set in a futuristic World State.', edition: 'Classic', shelfLocation: 'L1-06', totalCopies: 5 },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '978-0-44-151777-3', category: 'Fiction', publisher: 'Ace Books', publishedYear: 2000, language: 'English', description: 'The seminal cyberpunk novel that defined the genre.', edition: 'Classic', shelfLocation: 'L1-07', totalCopies: 4 },
  { title: 'Project Hail Mary', author: 'Andy Weir', isbn: '978-0-59-313520-4', category: 'Fiction', publisher: 'Ballantine Books', publishedYear: 2021, language: 'English', description: 'A lone astronaut must save the Earth from disaster.', edition: '1st', shelfLocation: 'L1-08', totalCopies: 6 },

  // Non-Fiction
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '978-0-37-453355-7', category: 'Non-Fiction', publisher: 'Farrar, Straus and Giroux', publishedYear: 2011, language: 'English', description: 'Kahneman explores the two systems that drive the way we think.', edition: '1st', shelfLocation: 'M1-01', totalCopies: 6 },
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '978-0-06-231609-7', category: 'Non-Fiction', publisher: 'Harper', publishedYear: 2015, language: 'English', description: 'An exploration of the history of Homo sapiens and our impact on the world.', edition: '1st', shelfLocation: 'M1-02', totalCopies: 8 },
  { title: 'The Power of Habit', author: 'Charles Duhigg', isbn: '978-0-81-298160-2', category: 'Non-Fiction', publisher: 'Random House', publishedYear: 2012, language: 'English', description: 'Why we do what we do in life and business.', edition: '1st', shelfLocation: 'M1-03', totalCopies: 5 },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '978-0-73-521129-2', category: 'Non-Fiction', publisher: 'Avery', publishedYear: 2018, language: 'English', description: 'An easy and proven way to build good habits and break bad ones.', edition: '1st', shelfLocation: 'M1-04', totalCopies: 9 },
  { title: 'Zero to One', author: 'Peter Thiel, Blake Masters', isbn: '978-0-80-413930-4', category: 'Non-Fiction', publisher: 'Crown Business', publishedYear: 2014, language: 'English', description: 'Notes on startups, or how to build the future.', edition: '1st', shelfLocation: 'M1-05', totalCopies: 5 },
  { title: 'Deep Work', author: 'Cal Newport', isbn: '978-1-45-554878-8', category: 'Non-Fiction', publisher: 'Grand Central Publishing', publishedYear: 2016, language: 'English', description: 'Rules for focused success in a distracted world.', edition: '1st', shelfLocation: 'M1-06', totalCopies: 6 },
  { title: 'The Lean Startup', author: 'Eric Ries', isbn: '978-0-30-788891-7', category: 'Non-Fiction', publisher: 'Crown Business', publishedYear: 2011, language: 'English', description: 'How today\'s entrepreneurs use continuous innovation to create businesses.', edition: '1st', shelfLocation: 'M1-07', totalCopies: 5 },

  // History
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '978-0-39-331755-8', category: 'History', publisher: 'Norton', publishedYear: 1999, language: 'English', description: 'The fates of human societies — why some civilizations conquered others.', edition: '1st', shelfLocation: 'N1-01', totalCopies: 5 },
  { title: 'The Rise and Fall of the Third Reich', author: 'William Shirer', isbn: '978-1-45-167800-1', category: 'History', publisher: 'Simon & Schuster', publishedYear: 2011, language: 'English', description: 'A history of Nazi Germany — the comprehensive account.', edition: 'Classic', shelfLocation: 'N1-02', totalCopies: 3 },
  { title: 'Homo Deus', author: 'Yuval Noah Harari', isbn: '978-0-06-246431-6', category: 'History', publisher: 'Harper', publishedYear: 2017, language: 'English', description: 'A brief history of tomorrow — the future of humanity.', edition: '1st', shelfLocation: 'N1-03', totalCopies: 5 },
  { title: 'The Silk Roads', author: 'Peter Frankopan', isbn: '978-1-10-185976-2', category: 'History', publisher: 'Knopf', publishedYear: 2015, language: 'English', description: 'A new history of the world through the lens of the ancient trade routes.', edition: '1st', shelfLocation: 'N1-04', totalCopies: 4 },
  { title: 'A People\'s History of the United States', author: 'Howard Zinn', isbn: '978-0-06-083865-2', category: 'History', publisher: 'Harper Perennial', publishedYear: 2005, language: 'English', description: 'American history from the perspective of ordinary people.', edition: 'Modern Classic', shelfLocation: 'N1-05', totalCopies: 4 },

  // Philosophy
  { title: 'Meditations', author: 'Marcus Aurelius', isbn: '978-0-14-044140-6', category: 'Philosophy', publisher: 'Penguin Classics', publishedYear: 2006, language: 'English', description: 'The reflections of Roman Emperor Marcus Aurelius — Stoic philosophy.', edition: 'Classics', shelfLocation: 'O1-01', totalCopies: 6 },
  { title: 'The Republic', author: 'Plato', isbn: '978-0-19-953700-5', category: 'Philosophy', publisher: 'Oxford University Press', publishedYear: 2008, language: 'English', description: 'Plato\'s famous dialogue on justice, society, and the nature of the ideal state.', edition: 'Classics', shelfLocation: 'O1-02', totalCopies: 4 },
  { title: 'Nicomachean Ethics', author: 'Aristotle', isbn: '978-0-87-220048-8', category: 'Philosophy', publisher: 'Hackett', publishedYear: 1999, language: 'English', description: 'Aristotle\'s systematic study of virtue, pleasure, and the good life.', edition: 'Revised', shelfLocation: 'O1-03', totalCopies: 3 },
  { title: 'Being and Time', author: 'Martin Heidegger', isbn: '978-0-06-090352-2', category: 'Philosophy', publisher: 'Harper Perennial', publishedYear: 2008, language: 'English', description: 'Heidegger\'s magnum opus on the nature of being and existence.', edition: 'Classic', shelfLocation: 'O1-04', totalCopies: 3 },
  { title: 'The Problems of Philosophy', author: 'Bertrand Russell', isbn: '978-0-19-888018-5', category: 'Philosophy', publisher: 'Oxford University Press', publishedYear: 2001, language: 'English', description: 'An accessible introduction to the central questions of philosophy.', edition: 'Classic', shelfLocation: 'O1-05', totalCopies: 4 },

  // Additional Programming & Web
  { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', isbn: '978-1-59-327584-6', category: 'Programming', publisher: 'No Starch Press', publishedYear: 2018, language: 'English', description: 'A modern introduction to programming with JavaScript.', edition: '3rd', shelfLocation: 'A2-01', totalCopies: 5 },
  { title: 'Head First Design Patterns', author: 'Eric Freeman, Elisabeth Robson', isbn: '978-0-59-600712-6', category: 'Programming', publisher: "O'Reilly", publishedYear: 2021, language: 'English', description: 'A brain-friendly guide to design patterns.', edition: '2nd', shelfLocation: 'A2-02', totalCopies: 4 },
  { title: 'Structure and Interpretation of Computer Programs', author: 'Abelson, Sussman', isbn: '978-0-26-251087-5', category: 'Programming', publisher: 'MIT Press', publishedYear: 1996, language: 'English', description: 'The classic MIT textbook on computer programming fundamentals.', edition: '2nd', shelfLocation: 'A2-03', totalCopies: 3 },
  { title: 'TypeScript in 50 Lessons', author: 'Stefan Baumgartner', isbn: '978-3-94-558019-3', category: 'Web Development', publisher: 'Smashing Magazine', publishedYear: 2020, language: 'English', description: 'Practical TypeScript — from basics to advanced types.', edition: '1st', shelfLocation: 'E2-01', totalCopies: 4 },
  { title: 'Full Stack React', author: 'Anthony Accomazzo', isbn: '978-0-99-174571-0', category: 'Web Development', publisher: 'Fullstack.io', publishedYear: 2017, language: 'English', description: 'The complete guide to ReactJS and friends.', edition: '1st', shelfLocation: 'E2-02', totalCopies: 4 },
  { title: 'Docker in Practice', author: 'Ian Miell, Aidan Hobson Sayers', isbn: '978-1-61-729732-7', category: 'Cloud Computing', publisher: 'Manning', publishedYear: 2019, language: 'English', description: '100+ techniques for real-world Docker usage.', edition: '2nd', shelfLocation: 'I2-01', totalCopies: 4 },
  { title: 'Site Reliability Engineering', author: 'Niall Murphy, Betsy Beyer', isbn: '978-1-49-192912-1', category: 'Cloud Computing', publisher: "O'Reilly", publishedYear: 2016, language: 'English', description: 'How Google runs production systems at scale.', edition: '1st', shelfLocation: 'I2-02', totalCopies: 3 },
  { title: 'The Feynman Lectures on Physics', author: 'Richard Feynman', isbn: '978-0-46-502304-2', category: 'Science', publisher: 'Basic Books', publishedYear: 2011, language: 'English', description: 'The classic physics lecture series by Nobel laureate Richard Feynman.', edition: 'Millennium', shelfLocation: 'K2-01', totalCopies: 3 },
  { title: 'Thinking in Systems', author: 'Donella Meadows', isbn: '978-1-60-358153-4', category: 'Non-Fiction', publisher: 'Chelsea Green', publishedYear: 2008, language: 'English', description: 'A primer on systems thinking and systems dynamics.', edition: '1st', shelfLocation: 'M2-01', totalCopies: 4 },
  { title: 'The Phoenix Project', author: 'Gene Kim, Kevin Behr', isbn: '978-1-94-278801-5', category: 'Non-Fiction', publisher: 'IT Revolution', publishedYear: 2018, language: 'English', description: 'A novel about IT, DevOps, and helping your business win.', edition: '5th', shelfLocation: 'M2-02', totalCopies: 5 },
  { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1-11-906333-9', category: 'Programming', publisher: 'Wiley', publishedYear: 2018, language: 'English', description: 'The definitive textbook on operating systems — "the dinosaur book".', edition: '10th', shelfLocation: 'A2-04', totalCopies: 6 },
  { title: 'Computer Organization and Design', author: 'David Patterson, John Hennessy', isbn: '978-0-12-820331-6', category: 'Programming', publisher: 'Morgan Kaufmann', publishedYear: 2020, language: 'English', description: 'The hardware/software interface — RISC-V edition.', edition: '5th', shelfLocation: 'A2-05', totalCopies: 4 },
  { title: 'Natural Language Processing with Python', author: 'Bird, Klein, Loper', isbn: '978-0-59-651649-9', category: 'Artificial Intelligence', publisher: "O'Reilly", publishedYear: 2009, language: 'English', description: 'Analyzing text with the Natural Language Toolkit.', edition: '1st', shelfLocation: 'B2-01', totalCopies: 4 },
  { title: 'Reinforcement Learning', author: 'Richard Sutton, Andrew Barto', isbn: '978-0-26-239326-4', category: 'Machine Learning', publisher: 'MIT Press', publishedYear: 2018, language: 'English', description: 'An introduction to reinforcement learning — from Sutton and Barto.', edition: '2nd', shelfLocation: 'C2-01', totalCopies: 4 },
];

// ── USERS DATA ────────────────────────────────────────────────────────────────
const USERS_DATA = [
  // Admins
  { name: 'Admin User',       email: 'admin@library.com',    password: 'Admin@123',    role: 'admin',     studentId: 'ADM001', department: 'Library Administration', phone: '+91-9800000001' },
  { name: 'Head Librarian',   email: 'librarian@library.com', password: 'Lib@12345',   role: 'librarian', studentId: 'LIB001', department: 'Library Sciences',        phone: '+91-9800000002' },
  // Students
  { name: 'Aarav Sharma',     email: 'aarav.sharma@student.edu',    password: 'Student@1', role: 'student', studentId: 'STU2024001', department: 'Computer Science',   phone: '+91-9811001001' },
  { name: 'Priya Patel',      email: 'priya.patel@student.edu',     password: 'Student@2', role: 'student', studentId: 'STU2024002', department: 'Information Technology', phone: '+91-9811001002' },
  { name: 'Rohan Verma',      email: 'rohan.verma@student.edu',     password: 'Student@3', role: 'student', studentId: 'STU2024003', department: 'Electronics',        phone: '+91-9811001003' },
  { name: 'Ananya Singh',     email: 'ananya.singh@student.edu',    password: 'Student@4', role: 'student', studentId: 'STU2024004', department: 'Mathematics',        phone: '+91-9811001004' },
  { name: 'Vikram Reddy',     email: 'vikram.reddy@student.edu',    password: 'Student@5', role: 'student', studentId: 'STU2024005', department: 'Data Science',       phone: '+91-9811001005' },
  { name: 'Kavya Nair',       email: 'kavya.nair@student.edu',      password: 'Student@6', role: 'student', studentId: 'STU2024006', department: 'Computer Science',   phone: '+91-9811001006' },
  { name: 'Arjun Mehta',      email: 'arjun.mehta@student.edu',     password: 'Student@7', role: 'student', studentId: 'STU2024007', department: 'Artificial Intelligence', phone: '+91-9811001007' },
  { name: 'Ishaan Gupta',     email: 'ishaan.gupta@student.edu',    password: 'Student@8', role: 'student', studentId: 'STU2024008', department: 'Cyber Security',     phone: '+91-9811001008' },
  { name: 'Pooja Joshi',      email: 'pooja.joshi@student.edu',     password: 'Student@9', role: 'student', studentId: 'STU2024009', department: 'Web Development',    phone: '+91-9811001009' },
  { name: 'Riya Khanna',      email: 'riya.khanna@student.edu',     password: 'Student@10', role: 'student', studentId: 'STU2024010', department: 'Physics',          phone: '+91-9811001010' },
  { name: 'Aditya Kumar',     email: 'aditya.kumar@student.edu',    password: 'Student@11', role: 'student', studentId: 'STU2024011', department: 'Computer Science', phone: '+91-9811001011' },
  { name: 'Meera Iyer',       email: 'meera.iyer@student.edu',      password: 'Student@12', role: 'student', studentId: 'STU2024012', department: 'Data Science',     phone: '+91-9811001012' },
  { name: 'Karan Bose',       email: 'karan.bose@student.edu',      password: 'Student@13', role: 'student', studentId: 'STU2024013', department: 'Machine Learning', phone: '+91-9811001013' },
  { name: 'Sneha Chauhan',    email: 'sneha.chauhan@student.edu',   password: 'Student@14', role: 'student', studentId: 'STU2024014', department: 'Information Technology', phone: '+91-9811001014' },
  { name: 'Dev Pillai',       email: 'dev.pillai@student.edu',      password: 'Student@15', role: 'student', studentId: 'STU2024015', department: 'Electronics',      phone: '+91-9811001015' },
  { name: 'Tanya Malhotra',   email: 'tanya.malhotra@student.edu',  password: 'Student@16', role: 'student', studentId: 'STU2024016', department: 'Mathematics',      phone: '+91-9811001016' },
  { name: 'Raj Saxena',       email: 'raj.saxena@student.edu',      password: 'Student@17', role: 'student', studentId: 'STU2024017', department: 'Cloud Computing',  phone: '+91-9811001017' },
  { name: 'Divya Thakur',     email: 'divya.thakur@student.edu',    password: 'Student@18', role: 'student', studentId: 'STU2024018', department: 'Computer Science', phone: '+91-9811001018' },
  { name: 'Nikhil Ahuja',     email: 'nikhil.ahuja@student.edu',    password: 'Student@19', role: 'student', studentId: 'STU2024019', department: 'Networking',       phone: '+91-9811001019' },
  { name: 'Sana Mirza',       email: 'sana.mirza@student.edu',      password: 'Student@20', role: 'student', studentId: 'STU2024020', department: 'Artificial Intelligence', phone: '+91-9811001020' },
  { name: 'Chirag Rao',       email: 'chirag.rao@student.edu',      password: 'Student@21', role: 'student', studentId: 'STU2024021', department: 'Data Science',     phone: '+91-9811001021' },
  { name: 'Neha Desai',       email: 'neha.desai@student.edu',      password: 'Student@22', role: 'student', studentId: 'STU2024022', department: 'Web Development',  phone: '+91-9811001022' },
  { name: 'Siddharth Jain',   email: 'sid.jain@student.edu',        password: 'Student@23', role: 'student', studentId: 'STU2024023', department: 'Machine Learning', phone: '+91-9811001023' },
];

// ── SEED FUNCTION ─────────────────────────────────────────────────────────────
async function seed() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // ── 1. Seed Categories ─────────────────────────────────────────────────────
    console.log('🌱 Seeding categories...');
    const categoryDocs = [];
    for (const cat of CATEGORIES) {
      const doc = await Category.findOneAndUpdate(
        { name: cat.name },
        cat,
        { upsert: true, new: true }
      );
      categoryDocs.push(doc);
    }
    console.log(`   ✓ ${categoryDocs.length} categories`);

    // ── 2. Seed Books ──────────────────────────────────────────────────────────
    console.log('🌱 Seeding books...');
    const bookDocs = [];
    for (let i = 0; i < BOOKS_DATA.length; i++) {
      const b = BOOKS_DATA[i];
      const borrowCount = randInt(0, 120);
      const issuedCopies = Math.min(randInt(0, 2), b.totalCopies - 1);
      const reservedCopies = Math.min(randInt(0, 1), b.totalCopies - issuedCopies - 1);
      const availableCopies = b.totalCopies - issuedCopies - reservedCopies;

      // Picsum cover image (deterministic by seed index)
      const coverImage = `https://picsum.photos/seed/${200 + i}/400/560`;

      const doc = await Book.findOneAndUpdate(
        { isbn: b.isbn },
        {
          ...b,
          availableCopies: Math.max(0, availableCopies),
          reservedCopies,
          issuedCopies,
          borrowCount,
          coverImage,
        },
        { upsert: true, new: true }
      );
      bookDocs.push(doc);
    }
    console.log(`   ✓ ${bookDocs.length} books`);

    // ── 3. Seed Users ──────────────────────────────────────────────────────────
    console.log('🌱 Seeding users...');
    const userDocs = [];
    for (const u of USERS_DATA) {
      // Check if user exists to avoid re-hashing password
      let doc = await User.findOne({ email: u.email }).select('+password');
      if (!doc) {
        doc = await User.create(u);
      }
      userDocs.push(doc);
    }
    console.log(`   ✓ ${userDocs.length} users`);

    // ── 4. Seed Reservations ───────────────────────────────────────────────────
    console.log('🌱 Seeding reservations...');
    const students = userDocs.filter(u => u.role === 'student');
    const admin = userDocs.find(u => u.role === 'admin') || userDocs[0];

    const statuses = ['pending', 'approved', 'issued', 'returned', 'cancelled'];
    let reservationCount = 0;

    for (const student of students) {
      // Each student gets 6–12 reservations
      const count = randInt(6, 12);
      const usedBooks = new Set();

      for (let i = 0; i < count; i++) {
        let book;
        let attempts = 0;
        do {
          book = rand(bookDocs);
          attempts++;
        } while (usedBooks.has(book._id.toString()) && attempts < 20);

        if (usedBooks.has(book._id.toString())) continue;
        usedBooks.add(book._id.toString());

        const status = rand(statuses);
        const daysBack = randInt(1, 180);
        const reservationDate = daysAgo(daysBack);

        const doc = {
          user:  student._id,
          book:  book._id,
          status,
          reservationDate,
          approvedBy: admin._id,
        };

        if (['approved', 'issued', 'returned'].includes(status)) {
          doc.issueDate = new Date(reservationDate.getTime() + 2 * 86400000);
          doc.dueDate   = new Date(doc.issueDate.getTime() + 14 * 86400000);
        }
        if (status === 'returned') {
          const returnedEarly = Math.random() > 0.2;
          doc.returnDate = returnedEarly
            ? new Date(doc.dueDate.getTime() - randInt(1, 10) * 86400000)
            : new Date(doc.dueDate.getTime() + randInt(1, 7) * 86400000);

          if (doc.returnDate > doc.dueDate) {
            const days = Math.ceil((doc.returnDate - doc.dueDate) / 86400000);
            doc.fine = { amount: days * 5, paid: Math.random() > 0.5 };
          }
        }
        if (status === 'issued') {
          const overdue = Math.random() > 0.7;
          if (overdue) doc.dueDate = daysAgo(randInt(1, 15));
          doc.renewalCount = rand([0, 0, 0, 1, 1, 2]);
          if (doc.renewalCount > 0) doc.renewedAt = new Date(doc.dueDate.getTime() - 7 * 86400000);
        }

        await Reservation.create(doc);
        reservationCount++;
      }
    }
    console.log(`   ✓ ${reservationCount} reservations`);

    // ── 5. Seed Wishlists ──────────────────────────────────────────────────────
    console.log('🌱 Seeding wishlists...');
    for (const student of students) {
      const wishlistBooks = [...bookDocs].sort(() => 0.5 - Math.random()).slice(0, randInt(3, 8));
      await User.findByIdAndUpdate(student._id, {
        wishlist:       wishlistBooks.map(b => b._id),
        recentlyViewed: [...bookDocs].sort(() => 0.5 - Math.random()).slice(0, 5).map(b => b._id),
      });
    }
    console.log(`   ✓ wishlists populated`);

    // ── 6. Seed Notifications ──────────────────────────────────────────────────
    console.log('🌱 Seeding notifications...');
    const notifTemplates = [
      { title: 'Reservation Approved 📚', message: 'Your reservation has been approved. Please collect the book from the library within 3 days.', type: 'info' },
      { title: 'Book Issued ✅', message: 'Your book has been issued. Due date: in 14 days. Please return it on time to avoid fines.', type: 'success' },
      { title: 'Due Date Reminder ⏰', message: 'Your book is due in 3 days. Please return it on time to avoid a fine.', type: 'warning' },
      { title: 'Fine Applied ⚠️', message: 'A fine of ₹25 has been applied to your account for overdue return.', type: 'warning' },
      { title: 'Welcome to Smart Library! 🎉', message: 'Your account is active. Browse our catalog and reserve books today!', type: 'success' },
      { title: 'Reservation Cancelled', message: 'Your reservation has been cancelled. The book is now available for others.', type: 'error' },
      { title: 'New Books Added 📖', message: 'New books have been added to the catalog. Check them out!', type: 'info' },
    ];
    let notifCount = 0;
    for (const student of students) {
      const count = randInt(2, 5);
      for (let i = 0; i < count; i++) {
        const tmpl = rand(notifTemplates);
        await Notification.create({
          user:    student._id,
          ...tmpl,
          isRead:  Math.random() > 0.4,
          createdAt: daysAgo(randInt(0, 30)),
        });
        notifCount++;
      }
    }
    console.log(`   ✓ ${notifCount} notifications`);

    // ── 7. Seed Activity Logs ──────────────────────────────────────────────────
    console.log('🌱 Seeding activity logs...');
    const actions = [
      { action: 'USER_REGISTERED',     details: (u) => `${u.name} registered as ${u.role}` },
      { action: 'BOOK_ADDED',          details: (u) => `New book added by ${u.name}` },
      { action: 'RESERVATION_CREATED', details: (u) => `${u.name} reserved a book` },
      { action: 'RESERVATION_ISSUED',  details: (u) => `Book issued to ${u.name}` },
      { action: 'RESERVATION_RETURNED', details: (u) => `${u.name} returned a book` },
      { action: 'PROFILE_UPDATED',     details: (u) => `${u.name} updated their profile` },
    ];
    let logCount = 0;
    for (const user of students.slice(0, 10)) {
      for (let i = 0; i < randInt(2, 5); i++) {
        const act = rand(actions);
        await ActivityLog.create({
          user:    user._id,
          action:  act.action,
          details: act.details(user),
          createdAt: daysAgo(randInt(0, 60)),
        });
        logCount++;
      }
    }
    console.log(`   ✓ ${logCount} activity logs`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('🔑 Admin Login:');
    console.log('   Email: admin@library.com');
    console.log('   Password: Admin@123');
    console.log('\n🔑 Librarian Login:');
    console.log('   Email: librarian@library.com');
    console.log('   Password: Lib@12345');
    console.log('\n🔑 Sample Student Login:');
    console.log('   Email: aarav.sharma@student.edu');
    console.log('   Password: Student@1');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
