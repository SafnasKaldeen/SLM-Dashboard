
export default function formatPrompt(
  job_title,
  job_description,
  number_of_questions,
  level
) {
  return `You are a helpful assistant. Your task is to generate questions for an interview.
  
    You will be provided with the following details.
    1. Job Title and Description
    2. Level of Difficulty - You must generate questions that suit the level of difficulty of the interview.
    3. The number of questions that must be generated.
    
    Guidelines:
    1. Ensure that you generate only the given number of questions.
    2. The questions should be relevant to the job role and should be open-ended where applicable.
    3. Strictly follow the output format specified.
    4. On the generation of each question, you must also specify it's level of importance.
    5. Based on the number of questions that must be generated, the question composition by the level of importance varies as follows.
    - 5 questions -> <2 questions of "high" importance, 2 questions of "medium" importance, 1 question of "low" importance>
    - 10 questions -> <5 questions of "high" importance, 3 questions of "medium" importance, 2 question of "low" importance>
    - 15 questions -> <7 questions of "high" importance, 5 questions of "medium" importance, 3 question of "low" importance>
    - 20 questions -> <9 questions of "high" importance, 7 questions of "medium" importance, 4 question of "low" importance>
    6. The questions must be put in order such that a good flow can be maintained throughout the interview.
    
    The following example illustrates how the questions must be generated.
    
    START OF EXAMPLE 1
    
    USER:
    - Job Title - Full Stack Developer
    - Job Description - As a Full Stack Developer, you will be responsible for developing and maintaining both the front-end and back-end components of web applications. This role involves:

        - Collaborating with other developers and designers to create user-friendly web interfaces.
        - Integrating APIs and databases to ensure smooth functionality.
        - Focusing primarily on building and troubleshooting straightforward features.
        - Ensuring communication between client and server sides.
    
        At this level, basic proficiency in front-end technologies (HTML, CSS, JavaScript) and back-end languages (Node.js, Python) is expected. Familiarity with web frameworks like React and Express.js is beneficial. You will also handle simple tasks related to databases and deploying code to production environments.
    
    - Level of Difficulty - Easy
    - Number of questions - 5
    
    ASSISTANT: 
        const Questions = {
          questions: [
            {
              question: "Can you describe a project where you developed both the front-end and back-end components?",
              importance: "high",
            },
            {
              question: "What strategies do you use to troubleshoot issues in web applications?",
              importance: "medium",
            },
            {
              question: "How do you ensure the user interface is intuitive and user-friendly?",
              importance: "high",
            },
            {
              question: "What are some common challenges you face when integrating APIs into your applications?",
              importance: "medium",
            },
            {
              question: "Can you explain how you would approach learning a new technology, such as a web framework?",
              importance: "low",
            },
          ],
        };
    
    END OF EXAMPLE 1
    
    START OF EXAMPLE 2
    
    USER:
    - Job Title - Software Engineer
    - Job Description - As a Full Stack Developer, you will take on more complex responsibilities in both front-end and back-end development. This role requires:

            - Developing, testing, and maintaining scalable web applications with both client-side and server-side components.
            - Designing more advanced user interfaces and optimizing them for performance.
            - Building and integrating APIs with a focus on security and efficiency.
            - Managing databases and ensuring data integrity, while handling more sophisticated queries and interactions.
            - Troubleshooting and solving intermediate-level bugs and performance bottlenecks in the application.
            
            At this level, you should have a solid understanding of front-end technologies such as HTML, CSS, JavaScript (with frameworks like React or Angular), as well as back-end technologies including Node.js or Python. Familiarity with databases like PostgreSQL or MongoDB is necessary. Additionally, experience with deployment pipelines, version control systems (e.g., Git), and cloud services (e.g., AWS, Azure) is advantageous. You are expected to have the ability to work independently on moderately complex tasks, while still collaborating with cross-functional teams to deliver quality web applications.
                
    - Level of Difficulty - Medium
    - Number of questions - 10
    
    ASSISTANT:
    
    const Questions = {
      questions: [
        {
          question: "Can you describe your experience with developing and maintaining scalable web applications?",
          importance: "high",
        },
        {
          question: "What approaches do you take to optimize the performance of user interfaces?",
          importance: "high",
        },
        {
          question: "How do you ensure security when integrating APIs into your applications?",
          importance: "high",
        },
        {
          question: "What strategies do you use for managing database integrity and handling complex queries?",
          importance: "high",
        },
        {
          question: "Can you provide an example of a bug you encountered and how you resolved it?",
          importance: "high",
        },
        {
          question: "How do you collaborate with cross-functional teams during development?",
          importance: "medium",
        },
        {
          question: "What tools do you use for version control, and why are they important?",
          importance: "medium",
        },
        {
          question: "How do you stay updated with new technologies and frameworks in web development?",
          importance: "low",
        },
        {
          question: "Can you explain your experience with cloud services like AWS or Azure?",
          importance: "low",
        },
        {
          question: "What is your approach to testing and deploying web applications?",
          importance: "low",
        },
      ],
    };
    
    END OF EXAMPLE 2
    
    START OF EXAMPLE 3
    
    USER:
    - Job Title - Full Stack Developer
    - Job Description - As a Full Stack Developer, you will be expected to tackle advanced challenges in both front-end and back-end development. This role involves:

            - Designing and implementing complex web applications with high scalability and performance.
            - Leading the architecture of multi-tier applications and integrating them with third-party services.
            - Developing robust and secure APIs while ensuring compliance with industry standards.
            - Conducting code reviews and mentoring junior developers to improve coding practices and team productivity.
            - Analyzing and optimizing database performance, including designing complex queries and data models.
            - Identifying and resolving high-level bugs and performance issues in production environments.
            - Staying updated with emerging technologies and trends, and applying them to enhance application functionality.
            
            At this level, a deep understanding of front-end technologies (HTML, CSS, JavaScript with frameworks such as React, Angular, or Vue.js) and back-end technologies (Node.js, Python, or Java) is crucial. Proficiency in database management systems (such as MySQL, PostgreSQL, or MongoDB) is essential. Experience with cloud computing platforms (AWS, Azure, Google Cloud) and DevOps practices, including CI/CD pipelines and containerization (Docker, Kubernetes), is highly advantageous. You should be able to lead projects, collaborate effectively with cross-functional teams, and deliver high-quality software solutions in a fast-paced environment.
                
    - Level of Difficulty - Medium
    - Number of questions - 15
    
    ASSISTANT:
    const Questions = {
  questions: [
    {
      question: "Can you describe a challenging project where you led the architecture of a multi-tier application?",
      importance: "high",
    },
    {
      question: "How do you ensure the APIs you develop are robust and secure?",
      importance: "high",
    },
    {
      question: "What strategies do you use to optimize database performance and design complex queries?",
      importance: "high",
    },
    {
      question: "Can you provide an example of a high-level bug you encountered in production and how you resolved it?",
      importance: "high",
    },
    {
      question: "How do you stay updated with emerging technologies and trends in software development?",
      importance: "high",
    },
    {
      question: "How do you approach designing scalable web applications?",
      importance: "high",
    },
    {
      question: "What process do you follow for conducting code reviews and mentoring junior developers?",
      importance: "medium",
    },
    {
      question: "What tools and practices do you recommend for CI/CD pipelines?",
      importance: "medium",
    },
    {
      question: "How do you ensure compliance with industry standards when developing APIs?",
      importance: "high",
    },
    {
      question: "What challenges have you faced when integrating third-party services into applications?",
      importance: "medium",
    },
    {
      question: "Can you explain your experience with containerization technologies like Docker or Kubernetes?",
      importance: "low",
    },
    {
      question: "How do you manage your time and prioritize tasks when leading a project?",
      importance: "low",
    },
    {
      question: "What is your approach to testing web applications before deployment?",
      importance: "low",
    },
    {
      question: "How do you handle communication within cross-functional teams?",
      importance: "low",
    },
    {
      question: "What is your experience with cloud computing platforms such as AWS or Azure?",
      importance: "low",
    },
  ],
};
    
    END OF EXAMPLE 3
    
    Generate suitable questions along with their level of importance for the following interview.
    - Job Title - ${job_title}
    - Job Description - ${job_description}
    - Level of Difficulty - ${level}
    - Number of questions - ${number_of_questions}
    
    Note:
    1. Make sure you generate questions of different levels of importance based on the number of questions.
      - 5 questions -> <2 questions of "high" importance, 2 questions of "medium" importance, 1 question of "low" importance>
      - 10 questions -> <5 questions of "high" importance, 3 questions of "medium" importance, 2 question of "low" importance>
      - 15 questions -> <7 questions of "high" importance, 5 questions of "medium" importance, 3 question of "low" importance>
      - 20 questions -> <9 questions of "high" importance, 7 questions of "medium" importance, 4 question of "low" importance>
    2. The questions can be shuffled to maintain a good flow. You needn't list them in order of high-medium-low importance.
    3. Ensure that ${number_of_questions} are generated.
    4. You must generate questions in such an order so that the interview flow is well maintained. 
    5. Each question should only consist of one question. Avoid including sub questions.
   
    `;
}
