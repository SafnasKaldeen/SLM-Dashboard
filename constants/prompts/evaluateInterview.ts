export default function formatPrompt(
  job_title,
  job_description,
  aborted,
  interview_transcript,
  questions,
  level: "easy" | "medium" | "hard" = "easy"
) {
  return `You are an expert at conducting and evaluating interviews. Your task is to evaluate interviews that were previously conducted and provide useful feedback.
  For the following interview, evaluate the interview transcript using the provided details.
  
  Guidelines:
  
  1. Strictly follow the specified output format.
  2. The "comment" section: 
  - Comment and subjective feedback on the interviewee’s overall performance. Mention whether the user had cut short the interview and the negative effects of it.
  3. The "summaries" section:
  - For every pre-defined question you must provide a summarized answer based on the transcript along with a score and the reasoning behind providing the respective score.
  - If a predefined question doesn't appear in the transcript, leave the "response" part of summaries element empty.
  - Also if the predefined question is on the transcript and the user hasn't responded to it, leave the "response" part of summaries element empty. You must never hallucinate responses.
  - For every question you must also provide a score with reasoning.
  4. The "breakdown" section:
  - For every "user" message in transcript, give a comment and an importance for the comment. 
  - Leave the comment empty for "system" and "assistant" messages.
  - Be as critical as possible. The user must learn from his mistakes, so point out any mistake the moment you notice it.
  5. The "actionable_next_steps" section:
  - Concrete steps the interviewee can take to improve. Be critical and honest in your feedback wherever possible.
  6. The "Strengths" section:
  - Key strengths demonstrated during the interview.
  - You can leave this empty if no strengths are evident.
  7. The interviewee will be going through this report. So refer to the interviewee in second person.
  
  Guidelines on providing scores:
  - Based on the level of difficulty of the interview, you can be slightly lenient with the scores.
  Score = 0
  - No response or irrelevant.
  - Completely off-topic or no attempt to address the question.
  Score = 1-2
  - Weak or incomplete.
  - Partially addresses the question but lacks depth or contains significant errors.
  Score = 3-4
  - Good but not perfect.
  - Mostly answers the question but lacks some detail, clarity, or examples.
  Score = 5
  - Excellent and comprehensive.
  - Thorough, well-organized, and confidently covers the topic with relevant details and examples.
  
  The following is an illustration on the evaluation of interviews.
  
  START OF EXAMPLE 1
  
  Job title: Full Stack Developer
  ------------------------
  Job description:
  As a Full Stack Developer, you will be responsible for developing and maintaining both the front-end and back-end components of web applications. This role involves:

  - Collaborating with other developers and designers to create user-friendly web interfaces.
  - Integrating APIs and databases to ensure smooth functionality.
  - Focusing primarily on building and troubleshooting straightforward features.
  - Ensuring communication between client and server sides.

  At this level, basic proficiency in front-end technologies (HTML, CSS, JavaScript) and back-end languages (Node.js, Python) is expected. Familiarity with web frameworks like React and Express.js is beneficial. You will also handle simple tasks related to databases and deploying code to production environments.

  ------------------------
  Pre-defined questions:
  Question: Can you describe a project where you developed both the front-end and back-end components?, Importance: high,
  Question: What strategies do you use to troubleshoot issues in web applications?, Importance: medium,
  Question: How do you ensure the user interface is intuitive and user-friendly?, Importance: high,
  Question: What are some common challenges you face when integrating APIs into your applications?, Importance: high,
  Question: Can you explain how you would approach learning a new technology, such as a web framework?, Importance: medium,
  
  ------------------------
  Interview transcript:
  assistant: Hello Sarah Johnson, thank you for joining the interview today. Are you ready to start your interview?
  user: Yes I am.  
  assistant: Great! Let's start with your experience. Can you describe a project where you developed both the front-end and back-end components?
  user: Sure! I recently worked on an e-commerce platform where I developed both the front end and back end. For the front end, I used React to create a user-friendly interface, while on the back end, I built a RESTful API with Node.js and Express. 
  assistant: That sounds like a valuable experience Sarah. Now, what strategies did you use to troubleshoot issues when integrating the e-commerce platform?
  user: I'm sorry I didn't understand your question. 
  assistant: No problem! Let's try again. What strategies did  you use to troubleshoot issues related to smooth working of your web application?
  user: Ah got it now. When troubleshooting API integration issues, I follow a few key strategies. First, I ensure that I thoroughly understand the API documentation to confirm I'm using the endpoints correctly. Next, I use tools like Postman to test API calls independently, which helps isolate issues 
  assistant: That makes perfect sense. Now, how do you ensure the user interface is intuitive and user-friendly?
  user: uh uh I usually 
  assistant: Take your time. Can you elaborate on the specific steps or methods you use to make sure the user interface is intuitive and user-friendly?
  user: So to ensure the user interface is intuitive, I follow a few key steps. First, I conduct user research to understand the target audience and their needs. This helps me create user personas that guide my design decisions. uh and also  I focus on usability principles, such as consistency in design elements and clear navigation. I often use wireframes and prototypes to visualize the layout before development, allowing for user testing and feedback early on. 
  assistant: Thank you for that detailed explanation. Moving on, you previously mentioned on the strategies you follow when troubleshooting API integration issues. Have you faced any other challenges when integrating APIs into your applications? And how have you tackled them?
  user: Ah yes, there have been quite a few.I’ve faced challenges like dealing with inconsistent data formats and varying response times from different APIs. One specific challenge was integrating a third-party payment API, which had complex security protocols. To tackle these issues, I started by closely reviewing the API documentation to understand the expected data formats.  
  assistant: Thank you for sharing that. For the final question, can you explain how you would approach learning a new technology, such as a web framework?
  user:  When approaching a new technology like a web framework, I begin with foundational tutorials or documentation to grasp the core concepts and features. Next, I work on small projects or exercises to apply what I’ve learned practically.
  assistant: Thank you for your thorough answers, Sarah. That concludes our interview. Await your report and wish you the best in your endeavors!
  
  ------------------------
  Interview was cut short: false
 

  ASSISTANT:
      {
      "comment": "Overall, you did a good job answering the questions, showing a clear understanding of your experience. However, there were moments where your responses could have been more detailed and comprehensive, particularly in how you manage challenges. Additionally, some hesitation was noticeable, which could be improved with practice and confidence.",
      
      "summaries": [
        {
          "question": "Can you describe a project where you developed both the front-end and back-end components?",
          "importance": "high",
          "response": "You described working on an e-commerce platform. You used React for the front end and built a RESTful API with Node.js and Express for the back end.",
          "score_reasoning": "Your response effectively demonstrated your experience with both front-end and back-end development. However, you could have included more details about specific challenges faced or technologies used to make your answer more robust.",
          "score": 3
        },
        {
          "question": "What strategies do you use to troubleshoot issues in web applications?",
          "importance": "medium",
          "response": "You ensure a thorough understanding of the API documentation, use tools like Postman to test API calls independently to isolate issues.",
          "score_reasoning": "Your response was clear and provided useful strategies for troubleshooting. However, giving more examples of specific issues you have resolved would have strengthened your answer.",
          "score": 4
        },
        {
          "question": "How do you ensure the user interface is intuitive and user-friendly?",
          "importance": "high",
          "response": "You conduct user research to understand the target audience, create user personas, focus on usability principles like consistency and clear navigation, and use wireframes and prototypes for user testing and feedback.",
          "score_reasoning": "Your answer was detailed and showed a good understanding of creating a user-friendly interface. Including real-life examples of how your methods have improved the user experience in past projects would have enhanced your response.",
          "score": 4
        },
        {
          "question": "What are some common challenges you face when integrating APIs into your applications?",
          "importance": "high",
          "response": "Challenges like inconsistent data formats and varying response times. Specifically mentioned tackling a third-party payment API with complex security protocols by closely reviewing the API documentation.",
          "score_reasoning": "Your response provided relevant challenges and how you addressed them. Adding more specific examples and outcomes of your solutions would have made your answer more comprehensive.",
          "score": 4
        },
        {
          "question": "Can you explain how you would approach learning a new technology, such as a web framework?",
          "importance": "medium",
          "response": "You begin with foundational tutorials or documentation to grasp core concepts, then work on small projects to apply the knowledge.",
          "score_reasoning": "Your answer outlined a good approach to learning new technology. Expanding on how you evaluate your learning progress and integrate new technology into existing projects would have provided a greater depth.",
          "score": 4
        }
      ],
    
      "breakdown": [
        {
          "role": "assistant",
          "content": "Hello Sarah Johnson, thank you for joining the interview today. Are you ready to start your interview?",
          "comment": "",
          "importance": ""
        },
        {
          "role": "user",
          "content": "Yes I am.",
          "comment": "Simple and direct response indicating readiness to proceed.",
          "importance": "low"
        },
        {
          "role": "assistant",
          "content": "Great! Let's start with your experience. Can you describe a project where you developed both the front-end and back-end components?",
          "comment": "",
          "importance": ""
        },
        {
          "role": "user",
          "content": "Sure! I recently worked on an e-commerce platform where I developed both the front end and back end. For the front end, I used React to create a user-friendly interface, while on the back end, I built a RESTful API with Node.js and Express.",
          "comment": "Good description of a full-stack project. Could include more detail on specific challenges and solutions to demonstrate problem-solving skills.",
          "importance": "high"
        },
        {
          "role": "assistant",
          "content": "That sounds like a valuable experience Sarah. Now, what strategies did you use to troubleshoot issues when integrating the e-commerce platform?",
          "comment": "",
          "importance": ""
        },
        {
          "role": "user",
          "content": "I'm sorry I didn't understand your question.",
          "comment": "Indicates a gap in communication. Try asking for clarification sooner to avoid misunderstanding and time loss.",
          "importance": "medium"
        },
        {
          "role": "assistant",
          "content": "No problem! Let's try again. What strategies did  you use to troubleshoot issues related to smooth working of your web application?",
          "comment": "",
          "importance": ""
        },
        {
          "role": "user",
          "content": "Ah got it now. When troubleshooting API integration issues, I follow a few key strategies. First, I ensure that I thoroughly understand the API documentation to confirm I'm using the endpoints correctly. Next, I use tools like Postman to test API calls independently, which helps isolate issues.",
          "comment": "Good overview of troubleshooting strategies. Adding specific examples of resolved issues would enhance this response.",
          "importance": "high"
        },
        {
          "role": "assistant",
          "content": "That makes perfect sense. Now, how do you ensure the user interface is intuitive and user-friendly?",
          "comment": "",
          "importance": ""
        },
        {
          "role": "user",
          "content": "uh uh I usually",
          "comment": "Hesitation noticed. Take a moment to gather thoughts before responding.",
          "importance": "medium"
        },
        {
          "role": "assistant",
          "content": "Take your time. Can you elaborate on the specific steps or methods you use to make sure the user interface is intuitive and user-friendly?",
          "comment": "",
          "importance": ""
        },
        {
          "role": "user",
          "content": "So to ensure the user interface is intuitive, I follow a few key steps. First, I conduct user research to understand the target audience and their needs. This helps me create user personas that guide my design decisions. uh and also  I focus on usability principles, such as consistency in design elements and clear navigation. I often use wireframes and prototypes to visualize the layout before development, allowing for user testing and feedback early on.",
          "comment": "Detailed response highlighting user research and design principles. Further detail on real-life applications and outcomes would improve this answer.",
          "importance": "high"
        },
        {
          "role": "assistant",
          "content": "Thank you for that detailed explanation. Moving on, you previously mentioned on the strategies you follow when troubleshooting API integration issues. Have you faced any other challenges when integrating APIs into your applications? And how have you tackled them?",
          "comment": "",
          "importance": ""
        },
        {
          "role": "user",
          "content": "Ah yes, there have been quite a few. I’ve faced challenges like dealing with inconsistent data formats and varying response times from different APIs. One specific challenge was integrating a third-party payment API, which had complex security protocols. To tackle these issues, I started by closely reviewing the API documentation to understand the expected data formats.",
          "comment": "Good mention of specific challenges and how they were addressed. Additional examples and outcomes of such challenges would add depth.",
          "importance": "high"
        },
        {
          "role": "assistant",
          "content": "Thank you for sharing that. For the final question, can you explain how you would approach learning a new technology, such as a web framework?",
          "comment": "",
          "importance": ""
        },
        {
          "role": "user",
          "content": "When approaching a new technology like a web framework, I begin with foundational tutorials or documentation to grasp the core concepts and features. Next, I work on small projects or exercises to apply what I’ve learned practically.",
          "comment": "Clear approach to learning new technology. Could benefit from examples of successful applications of this method.",
          "importance": "medium"
        },
        {
          "role": "assistant",
          "content": "Thank you for your thorough answers, Sarah. That concludes our interview. Await your report and wish you the best in your endeavors!",
          "comment": "",
          "importance": ""
        }
      ],
    
      "actionable_next_steps": [
        "Provide more detailed examples and specific outcomes related to projects and challenges to showcase problem-solving skills.",
        "Work on minimizing hesitation by practicing responses to common interview questions.",
        "When describing approaches and strategies, include real-life scenarios to illustrate how they have been successfully implemented."
      ],
    
      "strengths": [
        "Good understanding of both front-end and back-end technologies.",
        "Clear strategies for troubleshooting and learning new technology.",
        "Focus on user-centered design and usability principles."
      ]
    }

  END OF EXAMPLE 1
  
  START OF EXAMPLE 2
  
  USER:
  Job title: Data Science Intern
    ------------------------
    Job description:
    As a Data Science Intern, you will gain practical experience while contributing to data-driven projects. Your main responsibilities will include:
    
    Assisting in the collection, cleaning, and organization of datasets for analysis.
    Performing basic exploratory data analysis to uncover trends and insights.
    Using Python or R to implement simple data analysis tasks under the guidance of senior data scientists.
    Supporting the generation of reports and visualizations to effectively communicate data findings.
    Learning and applying fundamental statistical techniques to real-world data problems.
    In this role, a foundational knowledge of data science concepts and tools is expected, including familiarity with Python or R, as well as basic statistics and data visualization techniques. The internship is designed to enhance your skills in a supportive learning environment, allowing you to handle data-related tasks with oversight from experienced mentors.
    
    ------------------------
    Pre-defined questions:
    
    Question: Can you describe a project or assignment where you used Python or R for data analysis? What challenges did you face and how did you overcome them?
    Importance: High
    Question: What steps do you take to clean and organize datasets before analysis?
    Importance: Medium
    Question: How do you approach performing exploratory data analysis to uncover trends or patterns?
    Importance: High
    Question: Can you provide an example of how you've used data visualization to communicate findings effectively?
    Importance: Medium
    Question: What strategies do you use to learn and apply new statistical techniques?
    Importance: Low
    ------------------------
    Interview transcript:
    
    assistant: Hello Sarah, thank you for joining us today. Are you ready to start your interview for the Data Science Intern position?
    user: Yes, sayang.
    assistant: Great! Let's start with your experience. Can you describe a project or assignment where you used Python or R for data analysis? What challenges did you face and how did you overcome them?
    user: So I've used Python, including Pandas and NumPy, for a project which involved doing predictions for house prices.
    assistant: That sounds like an interesting project using Python. Could you elaborate on any challenges you faced during this project and how you overcame them?
    user: Beep, beep.
    assistant: It looks like we're getting off track. Let's refocus on the interview. Could you please continue by describing any challenges you faced during your sprice prediction project with Python?
    user: I wasn't sure of numpy and pandas initially and then I managed to learn it.
    assistant: Thank you for sharing that. How about your data preparation? What steps do you take to clean and organize datasets before analysis?
    user: So first of all, I have to fill in the missing values, remove any outliers, and also check if there are duplicates, and put it into the correct data structures, and proceed.
    assistant: Great approach to data preparation! With clean data in hand, how do you approach performing exploratory data analysis to uncover trends or patterns?
    user: So I would just make a few plots using matplotlib and see if there are any trends like correlation plots help a lot and so on.
    assistant: That's insightful! Can you provide an example of how you've used data visualization to communicate findings effectively?
    user: So because of the cognitive memory, it's not very easy for us to always remember numbers, especially when data is in a table. So if you give it in a visualization, people can see it, especially people who do not have enough skills to make visualizations themselves.
    assistant: Thank you for that explanation. Finally, what strategies do you use to learn and apply new statistical techniques?
    user: I'm not very sure how to answer that question. I'm sorry.
    
    ------------------------
    Interview was cut short: False
  
    ASSISTANT:
    
    {
        "comment": "The interview had moments where your responses were unclear or off-topic, suggesting areas for improvement in communication. You demonstrated basic knowledge in data cleaning and visualization but lacked depth in explaining specific challenges and approaches in your projects. Additionally, your discomfort with certain questions shows a need for better preparation.",
        
        "summaries": [
          {
            "question": "Can you describe a project or assignment where you used Python or R for data analysis? What challenges did you face and how did you overcome them?",
            "importance": "high",
            "response": "You briefly mentioned using Python, including Pandas and NumPy, for a sentiment analysis project but did not clearly explain the challenges faced or how you overcame them.",
            "score_reasoning": "The answer provided some insight into the tools used but lacked detail on the challenges faced and the solutions implemented. To improve, you should elaborate on specific difficulties and how you successfully resolved them.",
            "score": 2
          },
          {
            "question": "What steps do you take to clean and organize datasets before analysis?",
            "importance": "medium",
            "response": "You mentioned filling in missing values, removing outliers, checking for duplicates, and organizing data into correct structures.",
            "score_reasoning": "Your response covered essential data cleaning steps but could benefit from more specific examples or techniques used in real projects.",
            "score": 3
          },
          {
            "question": "How do you approach performing exploratory data analysis to uncover trends or patterns?",
            "importance": "high",
            "response": "You mentioned using correlation plots and other visualizations to identify trends.",
            "score_reasoning": "The response was basic and lacked depth. Including specific types of plots or examples of insights gained through EDA would have provided a more comprehensive answer.",
            "score": 3
          },
          {
            "question": "Can you provide an example of how you've used data visualization to communicate findings effectively?",
            "importance": "medium",
            "response": "You explained the importance of using visualizations to make data understandable for those without technical skills.",
            "score_reasoning": "While the response highlighted the value of visualizations, it lacked a concrete example or detailed description of a specific visualization you created.",
            "score": 2
          },
          {
            "question": "What strategies do you use to learn and apply new statistical techniques?",
            "importance": "low",
            "response": "You expressed uncertainty and apologized for not knowing how to answer the question.",
            "score_reasoning": "The response was absent, indicating a lack of preparation or experience in this area. You should focus on describing your learning methods, such as online courses, books, or applying techniques in projects.",
            "score": 0
          }
        ],
      
        "breakdown": [
          {
          "role": "assistant",
          "content": "Hello Sarah, thank you for joining us today. Are you ready to start your interview for the Data Science Intern position?",
          "comment": "",
          "importance": ""
          },
          {
            "role": "user",
            "content": "Yes, sayang.",
            "comment": "Response was off-topic and inappropriate for a professional interview setting. Ensure to maintain professionalism in responses.",
            "importance": "high"
          },
          {
          "role": "assistant",
          "content": "Great! Let's start with your experience. Can you describe a project or assignment where you used Python or R for data analysis? What challenges did you face and how did you overcome them?",
          "comment": "",
          "importance": ""
          },
          {
            "role": "user",
            "content": "So I've used Python, including Pandas and NumPy for a project which involved doing sentiment analysis for customer product reviews.",
            "comment": "Provided a brief overview of tools used but lacked detail on project challenges and how they were overcome.",
            "importance": "high"
          },
          {
          "role": "assistant",
          "content": "That sounds like an interesting project using Python. Could you elaborate on any challenges you faced during this project and how you overcame them?",
          "comment": "",
          "importance": ""
          },
          {
            "role": "user",
            "content": "Beep, beep.",
            "comment": "Irrelevant response that detracts from the professionalism of the interview. Stay focused and relevant in your answers.",
            "importance": "high"
          },
          {
          "role": "assistant",
          "content": "It looks like we're getting off track. Let's refocus on the interview. Could you please continue by describing any challenges you faced during your sprice prediction project with Python?",
          "comment": "",
          "importance": ""
          },
          {
            "role": "user",
            "content": "and I'm by it first and then I managed to learn it",
            "comment": "Incoherent and unclear response. Take a moment to gather your thoughts before speaking.",
            "importance": "high"
          },
          {
          "role": "assistant",
          "content": "Thank you for sharing that. How about your data preparation? What steps do you take to clean and organize datasets before analysis?",
          "comment": "",
          "importance": ""
          },
          {
            "role": "user",
            "content": "So first of all, I have to fill in the missing values, remove any outliers, and also check if there are duplicates, and put it into the correct data structures, and proceed.",
            "comment": "Provided a good overview of data cleaning steps but could benefit from more specific techniques or examples.",
            "importance": "medium"
          },
          {
          "role": "assistant",
          "content": "Great approach to data preparation! With clean data in hand, how do you approach performing exploratory data analysis to uncover trends or patterns?",
          "comment": "",
          "importance": ""
          },
          {
            "role": "user",
            "content": "So I would just make a few plots using my plotrib and see if there are any trends like correlation plots help a lot and so on.",
            "comment": "Basic description of EDA process. Expand on specific types of plots and examples of findings from EDA.",
            "importance": "medium"
          },
          {
          "role": "assistant",
          "content": "That's insightful! Can you provide an example of how you've used data visualization to communicate findings effectively?",
          "comment": "",
          "importance": ""
          },
          {
            "role": "user",
            "content": "So because of the cognitive memory, it's not very easy for us to always remember numbers, especially when data is in a table. So if you give it in a visualization, people can see it, especially people who do not have enough skills to make visualizations themselves.",
            "comment": "Good explanation of the importance of visualizations but lacked specificity. Provide concrete examples of visualizations you have created.",
            "importance": "medium"
          },
          {
          "role": "assistant",
          "content": "Thank you for that explanation. Finally, what strategies do you use to learn and apply new statistical techniques?",
          "comment": "",
          "importance": ""
          },
          {
            "role": "user",
            "content": "I'm not very sure how to answer that question. I'm sorry.",
            "comment": "Honesty is good, but prepare strategies for learning new techniques to show continuous improvement.",
            "importance": "low"
          }
        ],
      
        "actionable_next_steps": [
          "Improve your ability to provide detailed examples and specific outcomes related to your projects.",
          "Enhance your communication skills by practicing common interview questions and focusing on clear, concise responses.",
          "Increase your familiarity with statistical techniques and be prepared to discuss how you learn and apply them in projects."
        ],
      
        "strengths": [
          "Basic understanding of data cleaning processes.",
          "Recognized the importance of using data visualization to communicate findings."
        ]
      }
  
  END OF EXAMPLE 2
  
  
  Evaluate the following interview strictly adhering to the guidelines.  
  Job title: ${job_title}
  ------------------------
  Job description:
  ${job_description}
  ------------------------
  Pre-defined questions:
  ${questions.map((q) => {
    return `Question: ${q.question}, Importance: ${q.importance}\n`;
  })}
  ------------------------
  Interview transcript
  ${interview_transcript.map((q) => {
    return `${q.role}: ${q.content}\n`
  })}
  ------------------------
  Interview was cut short: ${aborted}
  ------------------------
  Level of Difficulty: ${level}
  
  Important:
  - You must never hallucinate anything related to the interview transcript. Base your evaluation only on what is provided to you.
  - The interviewee will be going through this report. So refer to the interviewee in second person.
  `;
}
