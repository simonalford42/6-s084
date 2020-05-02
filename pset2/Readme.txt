6-s084 pset 2 solutions - Simon Alford

Code for problem 1 is in the problem1/ directory, and likewise for problem 2.

Problem 1
---------
 - Synthesis code for problem 1 is in problem1.sk. 
 - I bound the number of assignments at 3 and the expression depth at 3.
 - controlGen() contains my main solution, which takes 50-60 minutes to
   synthesize for me. 
 - If I bound the second and third assignment expressions to have depth one, I
   can run in about 15-20 minutes, but I wasn't sure if this is allowed. I included
   this solution in the controlGen2() generator.
 - problem1Tests.sk contains the test harness and the agent function which calls
   the controller on a set of obstacles and a goal.
 - problem1.out contains the program output for my synthesis code.
 - in the java/ directory I included the java code I wrote to help with the problem, generating
   random tests and debugging synthesized solutions.
 - Note: my synthesizer isn't behaving perfectly deterministically--sometimes,
   it outputs that it couldn't find any solution, saying "[ASSERT FAILURE]  No
   solutions found in folder /Users/alfordsimon/.sketch/tmp/problem1Tests.sk".

Problem 2
---------
 - I didn't finish this. I completed part (a), and have genSketch() implemented.
   the only thing I didn't get to do was make the generator code and then try to
   synthesize the solutions. But I think the rest of the stuff I did works. I
   made test cases, even though I didn't get to synthesize them.
