# Project Definition

## Problem

I currently manage my internship applications in an Excel spreadsheet. Updating and navigating this file manually is inconvenient and becomes increasingly difficult as the number of applications grows.

The application tracker should provide a simple and structured way to create, view, update, and delete internship applications. It should make the application process easier to manage and provide a practical service that can later be hosted in my homelab.

## Users

The initial user will be me.

In the future, the project could potentially become an open-source tool for students, trainees, or job seekers who need a simple way to organize their applications.

Supporting multiple users is not part of the initial version.

## Initial Product

The first usable version must allow the user to:

- Create an internship application
- List all internship applications
- View a single internship application
- Update an internship application
- Change the status of an application
- Delete an internship application

## Non-Goals

The initial version will not include:

- A graphical dashboard
- Public internet access
- Multiple users
- Authentication
- Email integration
- Automatic reminders
- Advanced monitoring
- Kubernetes

These features may be considered in later project stages.

## Learning Goals

This project should help me learn:

- Python application development
- FastAPI fundamentals
- REST API design
- Input validation and error handling
- Automated testing
- Database integration
- Git and structured commit workflows
- Containerization with Podman
- Linux service management
- Deployment to my Raspberry Pi
- Infrastructure automation
- CI/CD fundamentals
- Logging, monitoring, and documentation

The long-term goal is to develop practical skills relevant to software development, DevOps, system administration, and cloud engineering.

## Success Criteria

The first version is complete when:

- Applications can be created, viewed, updated, and deleted

- Application data is stored persistently

- Invalid input is handled without crashing the application

- The main API behavior is covered by automated tests

- The application can be started using documented instructions

- The application runs reliably on the Raspberry Pi

- No known critical bugs prevent normal usage

- The architecture and important technical decisions are documented
