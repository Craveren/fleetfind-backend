import json
import re

dummy_data = """
export const dummyUsers = [
    {
        "id": "user_1",
        "name": "Alex Smith",
        "email": "alexsmith@example.com",
        "image": "profile_img_a",
        "createdAt": "2025-10-06T11:04:03.485Z",
        "updatedAt": "2025-10-06T11:04:03.485Z"
    },
    {
        "id": "user_2",
        "name": "John Warrel",
        "email": "johnwarrel@example.com",
        "image": "profile_img_j",
        "createdAt": "2025-10-09T13:20:24.360Z",
        "updatedAt": "2025-10-09T13:20:24.360Z"
    },
    {
        "id": "user_3",
        "name": "Oliver Watts",
        "email": "oliverwatts@example.com",
        "image": "profile_img_o",
        "createdAt": "2025-09-01T04:31:22.043Z",
        "updatedAt": "2025-09-26T09:03:37.866Z"
    }
]

export const dummyWorkspaces = [
    {
        "id": "org_1",
        "name": "Corp Workspace",
        "slug": "corp-workspace",
        "description": null,
        "settings": {},
        "ownerId": "user_3",
        "createdAt": "2025-10-13T06:55:44.423Z",
        "image_url": "workspace_img_default",
        "updatedAt": "2025-10-13T07:17:36.890Z",
        "members": [
            {
                "id": "a7422a50-7dfb-4e34-989c-881481250f0e",
                "userId": "user_1",
                "workspaceId": "org_1",
                "message": "",
                "role": "ADMIN",
                "user": {
                    "id": "user_1",
                    "name": "Alex Smith",
                    "email": "alexsmith@example.com",
                    "image": "profile_img_a",
                    "createdAt": "2025-10-06T11:04:03.485Z",
                    "updatedAt": "2025-10-06T11:04:03.485Z"
                }
            },
            {
                "id": "b325ed10-00d8-4e22-b94d-33a9994fd06b",
                "userId": "user_2",
                "workspaceId": "org_1",
                "message": "",
                "role": "ADMIN",
                "user": {
                    "id": "user_2",
                    "name": "John Warrel",
                    "email": "johnwarrel@example.com",
                    "image": "profile_img_j",
                    "createdAt": "2025-10-09T13:20:24.360Z",
                    "updatedAt": "2025-10-09T13:20:24.360Z"
                }
            },
            {
                "id": "0f786ac0-62f7-493f-a5a0-787fd7c9c8b3",
                "userId": "user_3",
                "workspaceId": "org_1",
                "message": "",
                "role": "ADMIN",
                "user": {
                    "id": "user_3",
                    "name": "Oliver Watts",
                    "email": "oliverwatts@example.com",
                    "image": "profile_img_o",
                    "createdAt": "2025-09-01T04:31:22.043Z",
                    "updatedAt": "2025-09-26T09:03:37.866Z"
                }
            }
        ],
        "books": [
            {
                "id": "4d0f6ef3-e798-4d65-a864-00d9f8085c51",
                "name": "LaunchPad CRM",
                "description": "A next-gen CRM for startups to manage customer pipelines, analytics, and automation.",
                "priority": "HIGH",
                "status": "ACTIVE",
                "type": "HYBRID",
                "start_date": "2025-10-10T00:00:00.000Z",
                "end_date": "2026-02-28T00:00:00.000Z",
                "team_lead": "user_3",
                "workspaceId": "org_1",
                "progress": 65,
                "createdAt": "2025-10-13T08:01:35.491Z",
                "updatedAt": "2025-10-13T08:01:45.620Z",
                "publishingStages": [
                    { "id": "ps_1", "name": "Manuscript Review", "description": "Initial review of the manuscript.", "order": 1, "authorBookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51" },
                    { "id": "ps_2", "name": "Editing", "description": "Copyediting, line editing, and proofreading.", "order": 2, "authorBookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51" },
                    { "id": "ps_3", "name": "Design", "description": "Cover design and interior layout.", "order": 3, "authorBookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51" }
                ],
                "royalties": [
                    { "id": "roy_1", "sharePercentage": 50, "earnings": 1500.75, "authorBookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51", "bookId": "book_1" },
                    { "id": "roy_2", "sharePercentage": 50, "earnings": 250.20, "authorBookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51", "bookId": "book_2" }
                ],
                "launchPlans": [
                    { "id": "lp_1", "launchDate": "2026-03-15T00:00:00.000Z", "status": "PLANNED", "marketingBudget": 5000, "promotionChannels": ["Social Media", "Email Marketing"], "notes": "Focus on early bird promotions.", "authorBookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51" }
                ],
                "tasks": [
                    {
                        "id": "24ca6d74-7d32-41db-a257-906a90bca8f4",
                        "bookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51",
                        "title": "Design Dashboard UI",
                        "description": "Create a modern, responsive CRM dashboard layout.",
                        "status": "IN_PROGRESS",
                        "type": "FEATURE",
                        "priority": "HIGH",
                        "assigneeId": "user_1",
                        "due_date": "2025-10-31T00:00:00.000Z",
                        "createdAt": "2025-10-13T08:04:04.084Z",
                        "updatedAt": "2025-10-13T08:04:04.084Z",
                        "assignee": {
                            "id": "user_1",
                            "name": "Alex Smith",
                            "email": "alexsmith@example.com",
                            "image": "profile_img_a",
                            "createdAt": "2025-10-06T11:04:03.485Z",
                            "updatedAt": "2025-10-06T11:04:03.485Z"
                        },
                        "comments": [],
                        "publishingStageId": "ps_3"
                    },
                    {
                        "id": "9dbd5f04-5a29-4232-9e8c-a1d8e4c566df",
                        "bookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51",
                        "title": "Integrate Email API",
                        "description": "Set up SendGrid integration for email campaigns.",
                        "status": "TODO",
                        "type": "TASK",
                        "priority": "MEDIUM",
                        "assigneeId": "user_2",
                        "due_date": "2025-11-30T00:00:00.000Z",
                        "createdAt": "2025-10-13T08:10:31.922Z",
                        "updatedAt": "2025-10-13T08:10:31.922Z",
                        "assignee": {
                            "id": "user_2",
                            "name": "John Warrel",
                            "email": "johnwarrel@example.com",
                            "image": "profile_img_j",
                            "createdAt": "2025-10-09T13:20:24.360Z",
                            "updatedAt": "2025-10-09T13:20:24.360Z"
                        },
                        "comments": [],
                        "publishingStageId": "ps_1"
                    },
                    {
                        "id": "0e6798ad-8a1d-4bca-b0cd-8199491dbf03",
                        "bookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51",
                        "title": "Fix Duplicate Contact Bug",
                        "description": "Duplicate records appear when importing CSV files.",
                        "status": "TODO",
                        "type": "BUG",
                        "priority": "HIGH",
                        "assigneeId": "user_1",
                        "due_date": "2025-12-05T00:00:00.000Z",
                        "createdAt": "2025-10-13T08:11:33.779Z",
                        "updatedAt": "2025-10-13T08:11:33.779Z",
                        "assignee": {
                            "id": "user_1",
                            "name": "Alex Smith",
                            "email": "alexsmith@example.com",
                            "image": "profile_img_a",
                            "createdAt": "2025-10-06T11:04:03.485Z",
                            "updatedAt": "2025-10-06T11:04:03.485Z"
                        },
                        "comments": [],
                        "publishingStageId": "ps_1"
                    },
                    {
                        "id": "7989b4cc-1234-4816-a1d9-cc86cd09596a",
                        "bookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51",
                        "title": "Add Role-Based Access Control (RBAC)",
                        "description": "Define user roles and permissions for the dashboard.",
                        "status": "IN_PROGRESS",
                        "type": "IMPROVEMENT",
                        "priority": "MEDIUM",
                        "assigneeId": "user_2",
                        "due_date": "2025-12-20T00:00:00.000Z",
                        "createdAt": "2025-10-13T08:12:35.146Z",
                        "updatedAt": "2025-10-13T08:12:35.146Z",
                        "assignee": {
                            "id": "user_2",
                            "name": "John Warrel",
                            "email": "johnwarrel@example.com",
                            "image": "profile_img_j",
                            "createdAt": "2025-10-09T13:20:24.360Z",
                            "updatedAt": "2025-10-09T13:20:24.360Z"
                        },
                        "comments": [],
                        "publishingStageId": "ps_2"
                    }
                ],
                "members": [
                    {
                        "id": "17dc3764-737f-4584-9b54-d1a3b401527d",
                        "userId": "user_1",
                        "bookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51",
                        "user": {
                            "id": "user_1",
                            "name": "Alex Smith",
                            "email": "alexsmith@example.com",
                            "image": "profile_img_a",
                            "createdAt": "2025-10-06T11:04:03.485Z",
                            "updatedAt": "2025-10-06T11:04:03.485Z"
                        }
                    },
                    {
                        "id": "774b0f38-7fd7-431a-b3bd-63262f036ca9",
                        "userId": "user_2",
                        "bookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51",
                        "user": {
                            "id": "user_2",
                            "name": "John Warrel",
                            "email": "johnwarrel@example.com",
                            "image": "profile_img_j",
                            "createdAt": "2025-10-09T13:20:24.360Z",
                            "updatedAt": "2025-10-09T13:20:24.360Z"
                        }
                    },
                    {
                        "id": "573354b2-6649-4c7e-b4cc-7c94c93df340",
                        "userId": "user_3",
                        "bookId": "4d0f6ef3-e798-4d65-a864-00d9f8085c51",
                        "user": {
                            "id": "user_3",
                            "name": "Oliver Watts",
                            "email": "oliverwatts@example.com",
                            "image": "profile_img_o",
                            "createdAt": "2025-09-01T04:31:22.043Z",
                            "updatedAt": "2025-09-26T09:03:37.866Z"
                        }
                    }
                ]
            },
            {
                "id": "e5f0a667-e883-41c4-8c87-acb6494d6341",
                "name": "Brand Identity Overhaul",
                "description": "Rebranding client products with cohesive color palettes and typography systems.",
                "priority": "MEDIUM",
                "status": "PLANNING",
                "type": "ASSISTED",
                "start_date": "2025-10-18T00:00:00.000Z",
                "end_date": "2026-03-10T00:00:00.000Z",
                "team_lead": "user_3",
                "workspaceId": "org_1",
                "progress": 25,
                "createdAt": "2025-10-13T08:15:27.895Z",
                "updatedAt": "2025-10-13T08:16:32.157Z",
                "publishingStages": [
                    { "id": "ps_4", "name": "Marketing", "description": "Promotional activities and launch campaigns.", "order": 4, "authorBookId": "e5f0a667-e883-41c4-8c87-acb6494d6341" },
                    { "id": "ps_5", "name": "Distribution", "description": "Getting the book to retailers.", "order": 5, "authorBookId": "e5f0a667-e883-41c4-8c87-acb6494d6341" }
                ],
                "tasks": [
                    {
                        "id": "a51bd102-6789-4e60-81ba-57768c63b7db",
                        "bookId": "e5f0a667-e883-41c4-8c87-acb6494d6341",
                        "title": "Create New Logo Concepts",
                        "description": "Sketch and finalize 3 logo concepts for client review.",
                        "status": "IN_PROGRESS",
                        "type": "FEATURE",
                        "priority": "MEDIUM",
                        "assigneeId": "user_2",
                        "due_date": "2025-10-31T00:00:00.000Z",
                        "createdAt": "2025-10-13T08:16:19.936Z",
                        "updatedAt": "2025-10-13T08:16:19.936Z",
                        "assignee": {
                            "id": "user_2",
                            "name": "John Warrel",
                            "email": "johnwarrel@example.com",
                            "image": "profile_img_j",
                            "createdAt": "2025-10-09T13:20:24.360Z",
                            "updatedAt": "2025-10-09T13:20:24.360Z"
                        },
                        "comments": [],
                        "publishingStageId": "ps_4"
                    },
                    {
                        "id": "c7cafc09-5138-4918-9277-5ab94b520410",
                        "bookId": "e5f0a667-e883-41c4-8c87-acb6494d6341",
                        "title": "Update Typography System",
                        "description": "Introduce new font hierarchy with responsive scaling.",
                        "status": "TODO",
                        "type": "IMPROVEMENT",
                        "priority": "MEDIUM",
                        "assigneeId": "user_1",
                        "due_date": "2025-11-15T00:00:00.000Z",
                        "createdAt": "2025-10-13T08:17:36.730Z",
                        "updatedAt": "2025-10-13T08:17:36.730Z",
                        "assignee": {
                            "id": "user_1",
                            "name": "Alex Smith",
                            "email": "alexsmith@example.com",
                            "image": "profile_img_a",
                            "createdAt": "2025-10-06T11:04:03.485Z",
                            "updatedAt": "2025-10-06T11:04:03.485Z"
                        },
                        "comments": [],
                        "publishingStageId": "ps_5"
                    },
                    {
                        "id": "53883b41-1912-460e-8501-43363ff3f5d4",
                        "bookId": "e5f0a667-e883-41c4-8c87-acb6494d6341",
                        "title": "Client Feedback Integration",
                        "description": "Implement client-requested adjustments to the brand guide.",
                        "status": "TODO",
                        "type": "TASK",
                        "priority": "LOW",
                        "assigneeId": "user_2",
                        "due_date": "2025-10-31T00:00:00.000Z",
                        "createdAt": "2025-10-13T08:18:16.611Z",
                        "updatedAt": "2025-10-13T08:18:16.611Z",
                        "assignee": {
                            "id": "user_2",
                            "name": "John Warrel",
                            "email": "johnwarrel@example.com",
                            "image": "profile_img_j",
                            "createdAt": "2025-10-09T13:20:24.360Z",
                            "updatedAt": "2025-10-09T13:20:24.360Z"
                        },
                        "comments": [],
                        "publishingStageId": "ps_4"
                    }
                ],
                "launchPlans": [
                    { "id": "lp_2", "launchDate": "2026-04-01T00:00:00.000Z", "status": "IN_PROGRESS", "marketingBudget": 2000, "promotionChannels": ["Press Release", "Author Website"], "notes": "Coordinate with author for website updates.", "authorBookId": "e5f0a667-e883-41c4-8c87-acb6494d6341" }
                ],
                "members": [
                    {
                        "id": "32ad603e-c290-4f6e-860b-10212e1b080d",
                        "userId": "user_1",
                        "bookId": "e5f0a667-e883-41c4-8c87-acb6494d6341",
                        "user": {
                            "id": "user_1",
                            "name": "Alex Smith",
                            "email": "alexsmith@example.com",
                            "image": "profile_img_a",
                            "createdAt": "2025-10-06T11:04:03.485Z",
                            "updatedAt": "2025-10-06T11:04:03.485Z"
                        }
                    },
                    {
                        "id": "10e8e546-ac59-474a-a3fc-768795810c65",
                        "userId": "user_2",
                        "bookId": "e5f0a667-e883-41c4-8c87-acb6494d6341",
                        "user": {
                            "id": "user_2",
                            "name": "John Warrel",
                            "email": "johnwarrel@example.com",
                            "image": "profile_img_j",
                            "createdAt": "2025-10-09T13:20:24.360Z",
                            "updatedAt": "2025-10-09T13:20:24.360Z"
                        }
                    },
                    {
                        "id": "5a1f3c12-fcb2-40ef-91ee-dbd582219a8b",
                        "userId": "user_3",
                        "bookId": "e5f0a667-e883-41c4-8c87-acb6494d6341",
                        "user": {
                            "id": "user_3",
                            "name": "Oliver Watts",
                            "email": "oliverwatts@example.com",
                            "image": "profile_img_o",
                            "createdAt": "2025-09-01T04:31:22.043Z",
                            "updatedAt": "2025-09-26T09:03:37.866Z"
                        }
                    }
                ]
            }
        ],
        "owner": {
            "id": "user_3",
            "name": "Oliver Watts",
            "email": "oliverwatts@example.com",
            "image": "profile_img_o",
            "createdAt": "2025-09-01T04:31:22.043Z",
            "updatedAt": "2025-09-26T09:03:37.866Z"
        }
    },
    {
        "id": "org_2",
        "name": "Cloud Ops Hub",
        "slug": "cloud-ops-hub",
        "description": null,
        "settings": {},
        "ownerId": "user_3",
        "createdAt": "2025-10-13T08:19:36.035Z",
        "image_url": "workspace_img_default",
        "updatedAt": "2025-10-13T08:19:36.035Z",
        "members": [
            {
                "id": "f5d37afc-c287-4bd8-a607-b50d20837234",
                "userId": "user_3",
                "workspaceId": "org_2",
                "message": "",
                "role": "ADMIN",
                "user": {
                    "id": "user_3",
                    "name": "Oliver Watts",
                    "email": "oliverwatts@example.com",
                    "image": "profile_img_o",
                    "createdAt": "2025-09-01T04:31:22.043Z",
                    "updatedAt": "2025-09-26T09:03:37.866Z"
                }
            },
            {
                "id": "f5c04fe5-a0f5-4d34-bcf6-ea54dce1b546",
                "userId": "user_1",
                "workspaceId": "org_2",
                "message": "",
                "role": "ADMIN",
                "user": {
                    "id": "user_1",
                    "name": "Alex Smith",
                    "email": "alexsmith@example.com",
                    "image": "profile_img_a",
                    "createdAt": "2025-10-06T11:04:03.485Z",
                    "updatedAt": "2025-10-06T11:04:03.485Z"
                }
            },
            {
                "id": "9b29463a-e828-4d4e-9d64-8e57a3ad1a90",
                "userId": "user_2",
                "workspaceId": "org_2",
                "message": "",
                "role": "ADMIN",
                "user": {
                    "id": "user_2",
                    "name": "John Warrel",
                    "email": "johnwarrel@example.com",
                    "image": "profile_img_j",
                    "createdAt": "2025-10-09T13:20:24.360Z",
                    "updatedAt": "2025-10-09T13:20:24.360Z"
                }
            }
        ],
        "books": [
            {
                "id": "c45e93ec-2f68-4f07-af4b-aa84f1bd407c",
                "name": "Kubernetes Migration",
                "description": "Migrate the monolithic app infrastructure to Kubernetes for scalability.",
                "priority": "HIGH",
                "status": "ACTIVE",
                "type": "HYBRID",
                "start_date": "2025-10-15T00:00:00.000Z",
                "end_date": "2026-01-20T00:00:00.000Z",
                "team_lead": "user_3",
                "workspaceId": "org_2",
                "progress": 0,
                "createdAt": "2025-10-13T09:04:30.225Z",
                "updatedAt": "2025-10-13T09:04:30.225Z",
                "publishingStages": [],
                "tasks": [
                    {
                        "id": "fc8ac710-ad12-4508-b934-9d59dea01872",
                        "bookId": "c45e93ec-2f68-4f07-af4b-aa84f1bd407c",
                        "title": "Security Audit",
                        "description": "Run container vulnerability scans and review IAM roles.",
                        "status": "TODO",
                        "type": "OTHER",
                        "priority": "MEDIUM",
                        "assigneeId": "user_3",
                        "due_date": "2025-12-10T00:00:00.000Z",
                        "createdAt": "2025-10-13T09:05:59.062Z",
                        "updatedAt": "2025-10-13T09:05:59.062Z",
                        "assignee": {
                            "id": "user_3",
                            "name": "Oliver Watts",
                            "email": "oliverwatts@example.com",
                            "image": "profile_img_o",
                            "createdAt": "2025-09-01T04:31:22.043Z",
                            "updatedAt": "2025-09-26T09:03:37.866Z"
                        },
                        "comments": [],
                        "publishingStageId": null
                    },
                    {
                        "id": "1cd6f85d-889a-4a5b-901f-ed8fa221d62b",
                        "bookId": "c45e93ec-2f68-4f07-af4b-aa84f1bd407c",
                        "title": "Set Up EKS Cluster",
                        "description": "Provision EKS cluster on AWS and configure nodes.",
                        "status": "TODO",
                        "type": "TASK",
                        "priority": "HIGH",
                        "assigneeId": "user_1",
                        "due_date": "2025-12-15T00:00:00.000Z",
                        "createdAt": "2025-10-13T09:04:58.859Z",
                        "updatedAt": "2025-10-13T09:04:58.859Z",
                        "assignee": {
                            "id": "user_1",
                            "name": "Alex Smith",
                            "email": "alexsmith@example.com",
                            "image": "profile_img_a",
                            "createdAt": "2025-10-06T11:04:03.485Z",
                            "updatedAt": "2025-10-06T11:04:03.485Z"
                        },
                        "comments": [],
                        "publishingStageId": null
                    },
                    {
                        "id": "8125eeac-196d-4797-8b14-21260f46abcc",
                        "bookId": "c45e93ec-2f68-4f07-af4b-aa84f1bd407c",
                        "title": "Implement CI/CD with GitHub Actions",
                        "description": "Add build, test, and deploy steps using GitHub Actions.",
                        "status": "TODO",
                        "type": "TASK",
                        "priority": "MEDIUM",
                        "assigneeId": "user_2",
                        "due_date": "2025-10-31T00:00:00.000Z",
                        "createdAt": "2025-10-13T09:05:25.518Z",
                        "updatedAt": "2025-10-13T09:05:25.518Z",
                        "assignee": {
                            "id": "user_2",
                            "name": "John Warrel",
                            "email": "johnwarrel@example.com",
                            "image": "profile_img_j",
                            "createdAt": "2025-10-09T13:20:24.360Z",
                            "updatedAt": "2025-10-09T13:20:24.360Z"
                        },
                        "comments": [],
                        "publishingStageId": null
                    }
                ],
                "members": [
                    {
                        "id": "511552d5-eddd-4b12-a60d-fad0821682a7",
                        "userId": "user_3",
                        "bookId": "c45e93ec-2f68-4f07-af4b-aa84f1bd407c",
                        "user": {
                            "id": "user_3",
                            "name": "Oliver Watts",
                            "email": "oliverwatts@example.com",
                            "image": "profile_img_o",
                            "createdAt": "2025-09-01T04:31:22.043Z",
                            "updatedAt": "2025-09-26T09:03:37.866Z"
                        }
                    },
                    {
                        "id": "79c364eb-eca5-4056-bea9-46c2f54efe4c",
                        "userId": "user_1",
                        "bookId": "c45e93ec-2f68-4f07-af4b-aa84f1bd407c",
                        "user": {
                            "id": "user_1",
                            "name": "Alex Smith",
                            "email": "alexsmith@example.com",
                            "image": "profile_img_a",
                            "createdAt": "2025-10-06T11:04:03.485Z",
                            "updatedAt": "2025-10-06T11:04:03.485Z"
                        },
                        "comments": [],
                        "publishingStageId": null
                    },
                    {
                        "id": "5fcbda36-d327-4615-bb38-d871a014fe52",
                        "userId": "user_2",
                        "bookId": "c45e93ec-2f68-4f07-af4b-aa84f1bd407c",
                        "user": {
                            "id": "user_2",
                            "name": "John Warrel",
                            "email": "johnwarrel@example.com",
                            "image": "profile_img_j",
                            "createdAt": "2025-10-09T13:20:24.360Z",
                            "updatedAt": "2025-10-09T13:20:24.360Z"
                        },
                        "comments": [],
                        "publishingStageId": null
                    }
                ]
            }
        ],
        "owner": {
            "id": "user_3",
            "name": "Oliver Watts",
            "email": "oliverwatts@example.com",
            "image": "profile_img_o",
            "createdAt": "2025-09-01T04:31:22.043Z",
            "updatedAt": "2025-09-26T09:03:37.866Z"
        }
    }
]
"""

# Find the start and end of the dummyUsers array
users_start_idx = dummy_data.find("export const dummyUsers = [") + len("export const dummyUsers = ")
next_declaration_start_idx = dummy_data.find("export const dummyWorkspaces = [", users_start_idx)
users_end_idx = dummy_data.rfind(']', 0, next_declaration_start_idx) + 1
users_str = dummy_data[users_start_idx:users_end_idx].strip()

# Find the start and end of the dummyWorkspaces array
workspaces_start_idx = dummy_data.find("export const dummyWorkspaces = [") + len("export const dummyWorkspaces = ")
workspaces_end_idx = dummy_data.rfind("]") + 1
workspaces_str = dummy_data[workspaces_start_idx:workspaces_end_idx].strip()

dummyUsers = json.loads(users_str.replace("None", "null"))
dummyWorkspaces = json.loads(workspaces_str.replace("None", "null"))

def escape_sql_string(s):
    if s is None:
        return 'NULL'
    # Replace single quotes with two single quotes for SQL escaping
    escaped_s = str(s).replace("'", "''")
    return f"'{escaped_s}'"

def format_timestamp(ts):
    if ts is None:
        return 'NULL'
    # PostgreSQL expects ISO 8601 format with timezone.
    # The dummy data already provides this, so we just need to wrap it.
    return f"'{ts}'"

sql_statements = []

# Insert users
for user in dummyUsers:
    sql_statements.append(f"INSERT INTO users (id, name, email, image, created_at, updated_at) VALUES ({escape_sql_string(user['id'])}, {escape_sql_string(user['name'])}, {escape_sql_string(user['email'])}, {escape_sql_string(user['image'])}, {format_timestamp(user['createdAt'])}, {format_timestamp(user['updatedAt'])});")

# Insert workspaces and their members, then books and their nested data
for ws in dummyWorkspaces:
    # Insert workspace
    settings_json = json.dumps(ws['settings'])
    escaped_settings_json = settings_json.replace("'", "''") # Escape single quotes within the JSON string for the SQL literal
    sql_statements.append(f"INSERT INTO workspaces (id, name, slug, description, settings, owner_id, image_url, created_at, updated_at) VALUES ({escape_sql_string(ws['id'])}, {escape_sql_string(ws['name'])}, {escape_sql_string(ws['slug'])}, {escape_sql_string(ws['description'])}, '{escaped_settings_json}'::jsonb, {escape_sql_string(ws['ownerId'])}, {escape_sql_string(ws['image_url'])}, {format_timestamp(ws['createdAt'])}, {format_timestamp(ws['updatedAt'])});")

    # Insert workspace members
    for member in ws['members']:
        sql_statements.append(f"INSERT INTO workspace_members (id, user_id, workspace_id, role, message, created_at, updated_at) VALUES ({escape_sql_string(member['id'])}, {escape_sql_string(member['userId'])}, {escape_sql_string(member['workspaceId'])}, {escape_sql_string(member['role'])}, {escape_sql_string(member['message'])}, {format_timestamp(member['user']['createdAt'])}, {format_timestamp(member['user']['updatedAt'])});")

    # Insert books
    for book in ws.get('books', []):
        sql_statements.append(f"INSERT INTO books (id, workspace_id, name, description, priority, status, type, start_date, end_date, team_lead, progress, created_at, updated_at) VALUES ({escape_sql_string(book['id'])}, {escape_sql_string(book['workspaceId'])}, {escape_sql_string(book['name'])}, {escape_sql_string(book['description'])}, {escape_sql_string(book['priority'])}, {escape_sql_string(book['status'])}, {escape_sql_string(book['type'])}, {format_timestamp(book['start_date'])}, {format_timestamp(book['end_date'])}, {escape_sql_string(book['team_lead'])}, {book['progress']}, {format_timestamp(book['createdAt'])}, {format_timestamp(book['updatedAt'])});")

        # Insert book members
        for member in book.get('members', []):
            sql_statements.append(f"INSERT INTO book_members (id, user_id, book_id, created_at, updated_at) VALUES ({escape_sql_string(member['id'])}, {escape_sql_string(member['userId'])}, {escape_sql_string(member['bookId'])}, {format_timestamp(member['user']['createdAt'])}, {format_timestamp(member['user']['updatedAt'])});")

        # Insert publishing stages
        for stage in book.get('publishingStages', []):
            sql_statements.append(f"INSERT INTO publishing_stages (id, author_book_id, name, description, \"order\", created_at, updated_at) VALUES ({escape_sql_string(stage['id'])}, {escape_sql_string(stage['authorBookId'])}, {escape_sql_string(stage['name'])}, {escape_sql_string(stage['description'])}, {stage['order']}, {format_timestamp(book['createdAt'])}, {format_timestamp(book['updatedAt'])});")

        # Insert tasks
        for task in book.get('tasks', []):
            sql_statements.append(f"INSERT INTO tasks (id, book_id, publishing_stage_id, title, description, status, type, priority, assignee_id, due_date, created_at, updated_at) VALUES ({escape_sql_string(task['id'])}, {escape_sql_string(task['bookId'])}, {escape_sql_string(task.get('publishingStageId'))}, {escape_sql_string(task['title'])}, {escape_sql_string(task['description'])}, {escape_sql_string(task['status'])}, {escape_sql_string(task['type'])}, {escape_sql_string(task['priority'])}, {escape_sql_string(task['assigneeId'])}, {format_timestamp(task['due_date'])}, {format_timestamp(task['createdAt'])}, {format_timestamp(task['updatedAt'])});")

            # Insert comments for tasks
            for comment in task.get('comments', []):
                # Check if 'userId', 'content', 'createdAt', 'updatedAt' exist before accessing
                user_id = comment.get('userId')
                content = comment.get('content')
                created_at = comment.get('createdAt')
                updated_at = comment.get('updatedAt') # Assuming updated_at can be same as created_at for dummy data

                if user_id and content and created_at: # Ensure essential fields exist
                    sql_statements.append(f"INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at) VALUES ({escape_sql_string(comment['id'])}, {escape_sql_string(task['id'])}, {escape_sql_string(user_id)}, {escape_sql_string(content)}, {format_timestamp(created_at)}, {format_timestamp(updated_at)});")

        # Insert royalties
        for royalty in book.get('royalties', []):
            sql_statements.append(f"INSERT INTO royalties (id, author_book_id, share_percentage, earnings, created_at, updated_at) VALUES ({escape_sql_string(royalty['id'])}, {escape_sql_string(royalty['authorBookId'])}, {royalty['sharePercentage']}, {royalty['earnings']}, {format_timestamp(book['createdAt'])}, {format_timestamp(book['updatedAt'])});")

        # Insert launch plans
        for lp in book.get('launchPlans', []):
            promotion_channels_sql = f"ARRAY[{', '.join(escape_sql_string(channel) for channel in lp['promotionChannels'])}]" if lp.get('promotionChannels') else 'ARRAY[]::TEXT[]'
            sql_statements.append(f"INSERT INTO launch_plans (id, author_book_id, launch_date, status, marketing_budget, promotion_channels, notes, created_at, updated_at) VALUES ({escape_sql_string(lp['id'])}, {escape_sql_string(lp['authorBookId'])}, {format_timestamp(lp['launchDate'])}, {escape_sql_string(lp['status'])}, {lp['marketingBudget']}, {promotion_channels_sql}, {escape_sql_string(lp['notes'])}, {format_timestamp(book['createdAt'])}, {format_timestamp(book['updatedAt'])});")

# Write SQL statements to a file with UTF-8 encoding
output_file_name = "insert_dummy_data.sql"
with open(output_file_name, "w", encoding="utf-8") as f:
    for statement in sql_statements:
        f.write(statement + "\n")

print(f"SQL insert statements written to {output_file_name}")