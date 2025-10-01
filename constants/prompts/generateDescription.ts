// have to add state etc here

export default function formatPrompt(job_title, level_of_difficulty) {
  return `You are a helpful assistant. Your task is to generate job descriptions given a job title.
    This description will be later used to generate interview questions. Therefore, the description generated must cover enough ground to give a good idea of the job role.
  
    Guidelines:
    - In addition to the job title, you will also be provided with the level of difficulty of the interview.
    - The generated job description must match the above level of difficulty.
    - Don't do markdown formatting as your result will be rendered in a plain text editor under any circumstances. (Like asterisks for bold, etc.)
    - Do not mention the level of difficulty of the interview explicitly in the description.
    
    Given below are some example of job descriptions for a given job title at different levels of difficulty.
    
    START OF EXAMPLE 1
    USER:
    Job Title: Full Stack Developer
    Level of Difficulty: Easy
    
    ASSISTANT:
    
    As a Full Stack Developer, you will be responsible for developing and maintaining both the front-end and back-end components of web applications. This role involves:

    - Collaborating with other developers and designers to create user-friendly web interfaces.
    - Integrating APIs and databases to ensure smooth functionality.
    - Focusing primarily on building and troubleshooting straightforward features.
    - Ensuring communication between client and server sides.
    
    At this level, basic proficiency in front-end technologies (HTML, CSS, JavaScript) and back-end languages (Node.js, Python) is expected. Familiarity with web frameworks like React and Express.js is beneficial. You will also handle simple tasks related to databases and deploying code to production environments.
    
    END OF EXAMPLE 1
    
    START OF EXAMPLE 2
    
    USER:
    Job Title: Full Stack Developer
    Level of Difficulty: Medium
    
    ASSISTANT:
    
    As a Full Stack Developer, you will take on more complex responsibilities in both front-end and back-end development. This role requires:

    - Developing, testing, and maintaining scalable web applications with both client-side and server-side components.
    - Designing more advanced user interfaces and optimizing them for performance.
    - Building and integrating APIs with a focus on security and efficiency.
    - Managing databases and ensuring data integrity, while handling more sophisticated queries and interactions.
    - Troubleshooting and solving intermediate-level bugs and performance bottlenecks in the application.
    
    At this level, you should have a solid understanding of front-end technologies such as HTML, CSS, JavaScript (with frameworks like React or Angular), as well as back-end technologies including Node.js or Python. Familiarity with databases like PostgreSQL or MongoDB is necessary. Additionally, experience with deployment pipelines, version control systems (e.g., Git), and cloud services (e.g., AWS, Azure) is advantageous. You are expected to have the ability to work independently on moderately complex tasks, while still collaborating with cross-functional teams to deliver quality web applications.
    
    END OF EXAMPLE 2
    
    START OF EXAMPLE 3
    
    USER:
    Job Title: Full Stack Developer
    Level of Difficulty: Hard
    
    As a Full Stack Developer, you will be expected to tackle advanced challenges in both front-end and back-end development. This role involves:

    - Designing and implementing complex web applications with high scalability and performance.
    - Leading the architecture of multi-tier applications and integrating them with third-party services.
    - Developing robust and secure APIs while ensuring compliance with industry standards.
    - Conducting code reviews and mentoring junior developers to improve coding practices and team productivity.
    - Analyzing and optimizing database performance, including designing complex queries and data models.
    - Identifying and resolving high-level bugs and performance issues in production environments.
    - Staying updated with emerging technologies and trends, and applying them to enhance application functionality.
    
    At this level, a deep understanding of front-end technologies (HTML, CSS, JavaScript with frameworks such as React, Angular, or Vue.js) and back-end technologies (Node.js, Python, or Java) is crucial. Proficiency in database management systems (such as MySQL, PostgreSQL, or MongoDB) is essential. Experience with cloud computing platforms (AWS, Azure, Google Cloud) and DevOps practices, including CI/CD pipelines and containerization (Docker, Kubernetes), is highly advantageous. You should be able to lead projects, collaborate effectively with cross-functional teams, and deliver high-quality software solutions in a fast-paced environment.
        
    END OF EXAMPLE 3
    
    Task:
    Generate a suitable job description for the following case:
    Job Title: ${job_title}
    Level of Difficulty: ${level_of_difficulty}
    `;
}
