# Algo service layer

Ici c'est le layer algo diviser en container. Il y a une plus value 1 au niveau consomation on appel les services d'algo que quand on en a besoin et en plus l'API avec Flask c'est plustôt léger aussi. Example de post qui fonctionne : 

``curl -X POST http://localhost:3939/shortest_path -H "Content-Type: application/json" -d '{"graph": [[1,1,1,1],[1,0,1,1],[1,1,1,1],[1,1,1,1]], "start": [0,0], "goal": [3,3]}'``

www.plantuml.com/plantuml/png/RL9BQiCm4Dth54CsXK8kq4L9QEW7kWZvq4KeOIfF4b55TZIZGi_HKxZNCBrN9LiDCUxEUlFUcvatdh2Wbt2qIbt1hAbtnXanfOE26DpFLoXOkR8W6At5MCCe5Fm8a67Dv7DfIVx3Q8BfTLkPBgFdDeEPCYkTQsfYUF1O7Smf44TkVcvdAFZV0BeyLYMZ4rQREsl82RpGssiITa-rkRV8xotIVhLjoQlD_5CEqMMflQcahNV8jaDIjsU3Xal748qyWJrl32HW--tJjZ0Ut-Q-S0DFJiYZJhEg3CPwRuh8Mj0fDDz2yBXQpLMl6DdzcI9zvT487PDPGM0HVDQhFZDg-p57xRIgo2OPTz1GSf5sv9zFiZ-VHFKyXv95K-jGDRN7V28eiicWsI29gELW1GMA01gj3dQOHmwoPLUbuvpRHRxj8UAokvtH1znJSlD_rafDo1NfR_u5