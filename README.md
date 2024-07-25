# LoDashBoard
This is a CTF machine developed using Node.js. This web application contains 2 flags. Follow the steps below for installation and configuration.
## Clone the Application
### First, clone the application to your machine:
```
sudo git clone $link
cd lodashboard
```
### Docker 
#### On Ubuntu:
1.Install Docker via Snap:
```
sudo snap install docker
```
2.Build and run the Docker containers:
```
sudo docker-compose up --build
```
#### On Other Linux Distributions:
1.Install Docker:
```
sudo apt install -y docker.iosa
sudo systemctl start docker
sudo systemctl enable docker
```
2.Install Docker Compose:
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
3.Build and run the Docker containers:
```
sudo docker-compose up --build
```
-----------
**You can access the lab from TryHackMe also**:
- [TryHackMe - LoDashBoard](https://tryhackme.com)
