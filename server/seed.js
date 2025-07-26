import Course from "./models/Course.js";

const seedData = [
  {
    name: "Node.js Fundamentals Course",
    price: 4999,
    image: "https://tse4.mm.bing.net/th/id/OIP.26yZeCv-XbRVjeCKCeAidgHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "The Complete JavaScript Course",
    price: 2999,
    image: "https://tse3.mm.bing.net/th/id/OIP.u_QNnN7Auk4NDBQgp0CEcwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "The Complete React Course",
    price: 3999,
    image: "https://tse3.mm.bing.net/th/id/OIP.iu1lCMkUx0NDwQacmlY1BwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "The Complete Next.js Course",
    price: 1999,
    image: "https://strapi.dhiwise.com/uploads/Blog_Common_Image_Next_OG_Image_8ab5e85f77.png",
  },
  {
    name: "RegEx Pro Course",
    price: 999,
    image:
      "https://tse2.mm.bing.net/th/id/OIP.3M4MeidhH1EWiUlzNVfgxgHaD4?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Git and GitHub Fundamentals",
    price: 1499,
    image: "https://tse3.mm.bing.net/th/id/OIP.JuuEDamR3G2VESzZOLdZkQHaEP?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
];

export const seedDatabase = async () => {
  try {
    // Check if courses already exist
    const existingCourses = await Course.find();
    if (existingCourses.length === 0) {
      await Course.insertMany(seedData);
      console.log("Database seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
