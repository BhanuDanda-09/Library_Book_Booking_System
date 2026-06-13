export const demoBooks = [
  {
    _id: "demo-1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0446310789",
    category: "Fiction",
    totalCopies: 5,
    availableCopies: 3,
    publishedYear: 1960,
    publisher: "J. B. Lippincott & Co.",
    language: "English",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-2",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0553380163",
    category: "Science",
    totalCopies: 4,
    availableCopies: 2,
    publishedYear: 1988,
    publisher: "Bantam Books",
    language: "English",
    description: "A landmark volume in science writing by one of the great minds of our time, exploring the mysteries of the universe.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-3",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    isbn: "978-0201616224",
    category: "Technology",
    totalCopies: 6,
    availableCopies: 5,
    publishedYear: 1999,
    publisher: "Addison-Wesley",
    language: "English",
    description: "One of the most significant books on software development, detailing best practices and philosophy for coders.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-4",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "978-0062316097",
    category: "History",
    totalCopies: 8,
    availableCopies: 0,
    publishedYear: 2011,
    publisher: "Harper",
    language: "English",
    description: "An exploration of the history of human evolution, from the Stone Age to the modern silicon era.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-5",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn: "978-1451648539",
    category: "Biography",
    totalCopies: 4,
    availableCopies: 4,
    publishedYear: 2011,
    publisher: "Simon & Schuster",
    language: "English",
    description: "The exclusive biography of the creative entrepreneur whose passion for perfection revolutionized six industries.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-6",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262033848",
    category: "Mathematics",
    totalCopies: 3,
    availableCopies: 1,
    publishedYear: 2009,
    publisher: "MIT Press",
    language: "English",
    description: "A comprehensive and standard textbook on computer algorithms, covering a broad range of topics in depth.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-7",
    title: "The Story of Art",
    author: "E.H. Gombrich",
    isbn: "978-0714832470",
    category: "Arts",
    totalCopies: 2,
    availableCopies: 2,
    publishedYear: 1950,
    publisher: "Phaidon Press",
    language: "English",
    description: "One of the most famous and popular books on art ever written, surveying art history from prehistoric times to modernity.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-8",
    title: "Meditations",
    author: "Marcus Aurelius",
    isbn: "978-0812968255",
    category: "Philosophy",
    totalCopies: 5,
    availableCopies: 4,
    publishedYear: 180,
    publisher: "A.S.L. Company",
    language: "English",
    description: "A series of personal writings by the Roman Emperor Marcus Aurelius, recording his private notes to himself on Stoic philosophy.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-9",
    title: "Educated",
    author: "Tara Westover",
    isbn: "978-0399590504",
    category: "Non-Fiction",
    totalCopies: 7,
    availableCopies: 6,
    publishedYear: 2018,
    publisher: "Random House",
    language: "English",
    description: "An unforgettable memoir about a young girl who leaves her survivalist family in Idaho to pursue education at university.",
    coverImage: "",
    isActive: true
  },
  {
    _id: "demo-10",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0261102217",
    category: "Other",
    totalCopies: 10,
    availableCopies: 8,
    publishedYear: 1937,
    publisher: "George Allen & Unwin",
    language: "English",
    description: "A classic children's fantasy novel and prelude to the Lord of the Rings, following Bilbo Baggins on a quest.",
    coverImage: "",
    isActive: true
  }
];

export const demoBookings = [
  {
    _id: "booking-demo-1",
    book: demoBooks[2], // The Pragmatic Programmer
    reservationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    issueDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days left
    status: "issued",
    fine: { amount: 0, paid: false },
    user: { name: "Jane Student", email: "jane@example.com" }
  },
  {
    _id: "booking-demo-2",
    book: demoBooks[0], // To Kill a Mockingbird
    reservationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "pending",
    fine: { amount: 0, paid: false },
    user: { name: "Jane Student", email: "jane@example.com" }
  },
  {
    _id: "booking-demo-3",
    book: demoBooks[3], // Sapiens (Out of stock)
    reservationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    issueDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days overdue
    status: "issued", // will show overdue warning
    fine: { amount: 25.0, paid: false },
    user: { name: "Jane Student", email: "jane@example.com" }
  },
  {
    _id: "booking-demo-4",
    book: demoBooks[1], // A Brief History of Time
    reservationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    issueDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "returned",
    fine: { amount: 0, paid: true },
    user: { name: "Jane Student", email: "jane@example.com" }
  }
];
