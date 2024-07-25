db = db.getSiblingDB('lodashboard');

db.createCollection("users");

db.users.insertOne({
    fullname: "fakescript",
    username: "fakescript",
    email: "fakescript.bounty1@gmail.com",
    linkedin_profile: "https://www.linkedin.com/in/nicat-abbasli-872016261/",
    github_profile: "https://github.com/FakeScript0/",
    password: "$2b$10$6NojZgdqNiU.BTya.sPGEu6VIq.cbfHw9sshpk6UW41aJ9tGv9sOq",
    isAdmin: true
});

db.users.insertOne({
    fullname: "test123",
    username: "test123",
    email: "test123@gmail.com",
    linkedin_profile: "",
    github_profile: "",
    password: "$2b$10$uI15SCIPLaZAvUKtrpuGB.8z.XDrqaVELKSLOLIbP2h7VupfampBe",
    isAdmin: false
});