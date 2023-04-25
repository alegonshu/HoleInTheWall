# Hole in the Wall
## Dependencies
There is no requirement for any installation of dependencies to execute the project.

## Commands to run the project
To run the project locally, simply open index.html with Live Server. You can download Live Server in Extentions on Virtual Studio Code.

To run the project using the Kinect, simply stand in front of the screen, raise your hand for 2 seconds, and follow the instructions!

## Description
Hole in the Wall is an interactive game in which users must contort their bodies into specific shapes to fit through a sequence holes. Each hole runs under a timer. If the user manages to fit into it, they gain one point. Otherwise, the game ends and the user may choose to play again.

Our implementation of the game can be initiated when a user stands in front of the Kinect and raises their hand for 2 seconds. Once this action is detected, an instructions page comes up. The user must read the instructions and align themselves with an initial practice hole in order for the game to begin. Then, the first hole will come up and the game begins. If the user succeeds to fit the hole before time runs out, a new hole will be drawn and the game keeps track of their current score. Otherwise, they are directed to the game over page in which they may choose to play again by raising their hand for 2 seconds. 

## Tasks aim to address
The present project aims to address various tasks that are centered around improving the mental and physical health of the participants through an interactive interface:
1. Participants are encouraged to engage in physical activities or exercises while interacting with the interface, which can lead to enhanced physical and mental well-being. 
2. The interface offers a gamified element that can be leveraged to promote positive affect and enjoyment among the participants. 
3. The project supports mental challenges or puzzles that can lead to a sense of accomplishment and increased productivity, thereby reducing stress levels. 
4. The interface provides an opportunity for participants to take a break from work and engage in a de-stressing activity, thus uplifting their overall mood. 

## Constraints
Our prototype is built for a specific physical location where the TV in front of Davies Auditorium is located. It also depends on specific sensing capabilities such kinect skeleton tracking. We note that we have implemented such tracking so that only a single person in front of the Kinect is kept track of, so having multiple people walking past the screen is a non-issue. That said, if someone walks in front of the current person being tracked, it will interrupt the Kinect sensing. Another constraint is that if the person being tracked leaves the screen detection, the sensing will also be interrupted.

## Collaboration
- Alejandro helped with the following implementation details: extracting the body part coordinates from the kinect data, designing the holes, creating a random hole coordinates generator function, and the styling and content of main game screen and the game over screen. He also helped during debugging and testing.
- Tony was responsible for implementing the game state checking functionality to update the score and display "continue game" or "game over" messages, and worked on debugging these features. He also worked on using hand position as input to start the game and restart the game, which is a critical aspect of the game's interactivity. Additionally, Tony was involved in the styling of the starting page and instructions page.
- Zayyan's contribution to the project involves creating a random hole coordinate generator and implementing a function that checks if the body shape matches the hole. These tasks are essential to ensure that the game's difficulty and challenge level are consistent, which contributes to the overall enjoyment of the game.
- Lindsay works on the user tracking feature, allowing the game to detect and respond to the user's hand movements, enabling them to start and continue the game. She is also responsible for implementing a timer in the game and error handling, such as detecting when the body moves out of the screen.