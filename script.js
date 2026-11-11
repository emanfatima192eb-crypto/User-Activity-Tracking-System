
const activities = [
    { userId: 1, action: "login", timestamp: "2026-11-11T09:00:00" },
    { userId: 1, action: "view_page", timestamp: "2026-11-11T09:02:00" },
    { userId: 2, action: "login", timestamp: "2026-11-11T09:03:00" },
    { userId: 1, action: "download", timestamp: "2026-11-11T09:05:00" },
    { userId: 1, action: "download", timestamp: "2026-11-11T09:06:00" },
    { userId: 1, action: "download", timestamp: "2026-11-11T09:07:00" },
    { userId: 1, action: "download", timestamp: "2026-11-11T09:08:00" },
    { userId: 1, action: "download", timestamp: "2026-11-11T09:09:00" },
    { userId: 1, action: "download", timestamp: "2026-11-11T09:10:00" },
    { userId: 1, action: "logout", timestamp: "2026-11-11T09:15:00" },
    { userId: 2, action: "login", timestamp: "2026-11-11T09:20:00" },
    { userId: 2, action: "failed_login", timestamp: "2026-11-11T09:21:00" },
    { userId: 2, action: "failed_login", timestamp: "2026-11-11T09:22:00" },
    { userId: 2, action: "failed_login", timestamp: "2026-11-11T09:23:00" },
    { userId: 2, action: "failed_login", timestamp: "2026-11-11T09:24:00" },
    { userId: 1, action: "view_page", timestamp: "2026-11-11T22:00:00" }
];

console.log("All Activities:", activities);

function groupActivitiesByUser(activities) {
    const userActivities = new Map();

    activities.forEach(function(activity) {
        if (!userActivities.has(activity.userId)) {
            userActivities.set(activity.userId, []);
        }

        userActivities.get(activity.userId).push(activity);
    });

    return userActivities;
}

const groupedActivities = groupActivitiesByUser(activities);

console.log("Grouped Activities:", groupedActivities);

function getUserStatistics(activities) {
    const grouped = groupActivitiesByUser(activities);
    const statistics = [];

    grouped.forEach(function(userActivities, userId) {
        const sortedActivities = [...userActivities].sort(function(a, b) {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        const firstActivity = sortedActivities[0];
        const lastActivity = sortedActivities[sortedActivities.length - 1];

        const totalActivities = userActivities.length;

        const loginCount = userActivities.filter(function(activity) {
            return activity.action === "login";
        }).length;

        const login = userActivities.find(function(activity) {
            return activity.action === "login";
        });

        const logout = userActivities.find(function(activity) {
            return activity.action === "logout";
        });

        let sessionDuration = "No complete session";

        if (login && logout) {
            const duration = new Date(logout.timestamp) - new Date(login.timestamp);
            sessionDuration = duration / (1000 * 60) + " minutes";
        }

        const userData = {
            userId: userId,
            firstActivity: firstActivity.action,
            lastActivity: lastActivity.action,
            totalActivities: totalActivities,
            loginCount: loginCount,
            sessionDuration: sessionDuration,
            multipleLogins: loginCount > 1
        };

        statistics.push(userData);
    });

    return statistics;
}

const userStatistics = getUserStatistics(activities);

console.log("User  Statistics:", userStatistics);

document.getElementById("activityAnalysis").innerHTML =
    userStatistics.map(function(user) {
        return `
            <div>
                <h3>User ${user.userId}</h3>
                <p>First Activity: ${user.firstActivity}</p>
                <p>Last Activity: ${user.lastActivity}</p>
                <p>Total Activities: ${user.totalActivities}</p>
                <p>Login Count: ${user.loginCount}</p>
                <p>Session Duration: ${user.sessionDuration}</p>
                <p>Multiple Logins: ${user.multipleLogins}</p>
            </div>
            <hr>
        `;
    }).join("");
function detectUnusualActivities(activities, workingHours = { start: 9, end: 17 }) {
    const suspiciousActivities = [];
    const grouped = groupActivitiesByUser(activities);

    grouped.forEach(function(userActivities, userId) {

        const downloads = userActivities.filter(function(activity) {
            return activity.action === "download";
        });

        for (let i = 0; i < downloads.length; i++) {
            const currentTime = new Date(downloads[i].timestamp);

            const recentDownloads = downloads.filter(function(activity) {
                const time = new Date(activity.timestamp);

                return time >= currentTime &&
                    time <= new Date(currentTime.getTime() + 10 * 60 * 1000);
            });

            if (recentDownloads.length > 5) {
                suspiciousActivities.push({
                    userId: userId,
                    type: "Excessive Downloads",
                    count: recentDownloads.length,
                    timestamp: downloads[i].timestamp
                });

                break;
            }
        }

        const failedLogins = userActivities.filter(function(activity) {
            return activity.action === "failed_login";
        });

        for (let i = 0; i < failedLogins.length; i++) {
            const currentTime = new Date(failedLogins[i].timestamp);

            const recentAttempts = failedLogins.filter(function(activity) {
                const time = new Date(activity.timestamp);

                return time >= currentTime &&
                    time <= new Date(currentTime.getTime() + 5 * 60 * 1000);
            });

            if (recentAttempts.length > 3) {
                suspiciousActivities.push({
                    userId: userId,
                    type: "Multiple Failed Logins",
                    count: recentAttempts.length,
                    timestamp: failedLogins[i].timestamp
                });

                break;
            }
        }

        userActivities.forEach(function(activity) {
            const hour = new Date(activity.timestamp).getHours();

            if (hour < workingHours.start || hour >= workingHours.end) {
                suspiciousActivities.push({
                    userId: userId,
                    type: "Outside Working Hours",
                    timestamp: activity.timestamp
                });
            }
        });

        const loginCount = userActivities.filter(function(activity) {
            return activity.action === "login";
        }).length;

        const logoutCount = userActivities.filter(function(activity) {
            return activity.action === "logout";
        }).length;

        if (loginCount > logoutCount) {
            suspiciousActivities.push({
                userId: userId,
                type: "Possible Active Session",
                timestamp: userActivities[userActivities.length - 1].timestamp
            });
        }
    });

    return suspiciousActivities;
}

const suspiciousActivities = detectUnusualActivities(activities);

console.log("Suspicious Activities:", suspiciousActivities);

document.getElementById("unusualActivities").innerHTML =
    suspiciousActivities.map(function(item) {
        return `
            <div>
                <h3>${item.type}</h3>
                <p>User ID: ${item.userId}</p>
                <p>Time: ${item.timestamp}</p>
                ${item.count ? `<p>Count: ${item.count}</p>` : ""}
            </div>
            <hr>
        `;
    }).join("");
function getUserTimeline(userId, activities) {
    const userActivities = activities
        .filter(function(activity) {
            return activity.userId === Number(userId);
        })
        .sort(function(a, b) {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

    return userActivities.map(function(activity, index) {
        let elapsedTime = "First Activity";

        if (index > 0) {
            const previousTime = new Date(userActivities[index - 1].timestamp);
            const currentTime = new Date(activity.timestamp);

            const difference = (currentTime - previousTime) / (1000 * 60);

            elapsedTime = difference + " minutes";
        }

        return {
            userId: activity.userId,
            action: activity.action,
            timestamp: activity.timestamp,
            elapsedTime: elapsedTime
        };
    });
}
document.getElementById("timelineButton").addEventListener("click", function() {
    const userId = document.getElementById("userIdInput").value;

    const timeline = getUserTimeline(userId, activities);

    console.log("User Timeline:", timeline);

    document.getElementById("userTimeline").innerHTML =
        timeline.length > 0
            ? timeline.map(function(activity) {
                return `
                    <div>
                        <p>User ID: ${activity.userId}</p>
                        <p>Action: ${activity.action}</p>
                        <p>Time: ${activity.timestamp}</p>
                        <p>Elapsed Time: ${activity.elapsedTime}</p>
                    </div>
                    <hr>
                `;
            }).join("")
            : "<p>No activities found for this user.</p>";
});
let simulationInterval = null;

function generateRandomActivity() {
    const userIds = [1, 2, 3];

    const actions = [
        "login",
        "view_page",
        "download",
        "logout",
        "failed_login"
    ];

    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    return {
        userId: randomUser,
        action: randomAction,
        timestamp: new Date().toISOString().slice(0, 19)
    };
}

function updateActivityDisplay() {
    const updatedStatistics = getUserStatistics(activities);
    const updatedSuspicious = detectUnusualActivities(activities);

    console.log("Updated User Statistics:", updatedStatistics);
    console.log("Updated Suspicious Activities:", updatedSuspicious);

    document.getElementById("activityAnalysis").innerHTML =
        updatedStatistics.map(function(user) {
            return `
                <div>
                    <h3>User ${user.userId}</h3>
                    <p>First Activity: ${user.firstActivity}</p>
                    <p>Last Activity: ${user.lastActivity}</p>
                    <p>Total Activities: ${user.totalActivities}</p>
                    <p>Login Count: ${user.loginCount}</p>
                    <p>Session Duration: ${user.sessionDuration}</p>
                    <p>Multiple Logins: ${user.multipleLogins}</p>
                </div>
                <hr>
            `;
        }).join("");

    document.getElementById("unusualActivities").innerHTML =
        updatedSuspicious.map(function(item) {
            return `
                <div>
                    <h3>${item.type}</h3>
                    <p>User ID: ${item.userId}</p>
                    <p>Time: ${item.timestamp}</p>
                    ${item.count ? `<p>Count: ${item.count}</p>` : ""}
                </div>
                <hr>
            `;
        }).join("");
}

document.getElementById("startSimulation").addEventListener("click", function() {
    if (simulationInterval !== null) {
        return;
    }

    simulationInterval = setInterval(function() {
        const newActivity = generateRandomActivity();

        activities.push(newActivity);

        console.log("New Activity:", newActivity);

        document.getElementById("liveActivities").innerHTML =
            `<p>User ${newActivity.userId} - ${newActivity.action} - ${newActivity.timestamp}</p>` +
            document.getElementById("liveActivities").innerHTML;

        updateActivityDisplay();

    }, 2000);
});

document.getElementById("stopSimulation").addEventListener("click", function() {
    clearInterval(simulationInterval);
    simulationInterval = null;

    console.log("Activity Simulation Stopped");
});
function getMostActiveUser() {
    const grouped = groupActivitiesByUser(activities);

    let mostActiveUser = null;
    let maximumActivities = 0;

    grouped.forEach(function(userActivities, userId) {
        if (userActivities.length > maximumActivities) {
            maximumActivities = userActivities.length;
            mostActiveUser = userId;
        }
    });

    return {
        userId: mostActiveUser,
        totalActivities: maximumActivities
    };
}

function getActivitySummary() {
    const actionCounts = activities.reduce(function(summary, activity) {
        summary[activity.action] = (summary[activity.action] || 0) + 1;
        return summary;
    }, {});

    const uniqueUsers = new Set(
        activities.map(function(activity) {
            return activity.userId;
        })
    );

    return {
        totalActivities: activities.length,
        totalUsers: uniqueUsers.size,
        actionCounts: actionCounts
    };
}

const mostActiveUser = getMostActiveUser();
const activitySummary = getActivitySummary();

console.log("Most Active User:", mostActiveUser);
console.log("Activity Summary:", activitySummary);

document.getElementById("activitySummary").innerHTML = `
    <h3>Most Active User</h3>
    <p>User ID: ${mostActiveUser.userId}</p>
    <p>Total Activities: ${mostActiveUser.totalActivities}</p>

    <h3>Activity Summary</h3>
    <p>Total Activities: ${activitySummary.totalActivities}</p>
    <p>Total Users: ${activitySummary.totalUsers}</p>

    <h3>Action Counts</h3>
    ${Object.entries(activitySummary.actionCounts).map(function(item) {
        return `<p>${item[0]}: ${item[1]}</p>`;
    }).join("")}
`;
function getSuspiciousActivities() {
    return detectUnusualActivities(activities);
}

function getAverageSessionDuration() {
    const grouped = groupActivitiesByUser(activities);
    const sessionDurations = [];

    grouped.forEach(function(userActivities) {
        const sortedActivities = [...userActivities].sort(function(a, b) {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        let loginTime = null;

        sortedActivities.forEach(function(activity) {
            if (activity.action === "login" && loginTime === null) {
                loginTime = new Date(activity.timestamp);
            }

            if (activity.action === "logout" && loginTime !== null) {
                const duration = new Date(activity.timestamp) - loginTime;

                sessionDurations.push(duration / (1000 * 60));
                loginTime = null;
            }
        });
    });

    if (sessionDurations.length === 0) {
        return 0;
    }

    const totalDuration = sessionDurations.reduce(function(total, duration) {
        return total + duration;
    }, 0);

    return totalDuration / sessionDurations.length;
}

function getUserActivityScore(userId) {
    const userActivities = activities.filter(function(activity) {
        return activity.userId === Number(userId);
    });

    const score = userActivities.length * 10;

    return {
        userId: Number(userId),
        totalActivities: userActivities.length,
        activityScore: score
    };
}

const suspiciousResults = getSuspiciousActivities();
const averageSession = getAverageSessionDuration();
const userScore = getUserActivityScore(1);

console.log("Suspicious Activities:", suspiciousResults);
console.log("Average Session Duration:", averageSession, "minutes");
console.log("User Activity Score:", userScore);

document.getElementById("activitySummary").innerHTML += `
    <h3>Average Session Duration</h3>
    <p>${averageSession} minutes</p>

    <h3>User Activity Score</h3>
    <p>User ID: ${userScore.userId}</p>
    <p>Total Activities: ${userScore.totalActivities}</p>
    <p>Score: ${userScore.activityScore}</p>
`;
function debounce(callback, delay) {
    let timer;

    return function() {
        clearTimeout(timer);

        timer = setTimeout(function() {
            callback();
        }, delay);
    };
}

const searchTimeline = debounce(function() {
    const userId = document.getElementById("userIdInput").value;

    if (userId === "") {
        document.getElementById("userTimeline").innerHTML = "";
        return;
    }

    const timeline = getUserTimeline(userId, activities);

    console.log("Debounced User Timeline:", timeline);

    document.getElementById("userTimeline").innerHTML =
        timeline.length > 0
            ? timeline.map(function(activity) {
                return `
                    <div>
                        <p>User ID: ${activity.userId}</p>
                        <p>Action: ${activity.action}</p>
                        <p>Time: ${activity.timestamp}</p>
                        <p>Elapsed Time: ${activity.elapsedTime}</p>
                    </div>
                    <hr>
                `;
            }).join("")
            : "<p>No activities found for this user.</p>";

}, 500);

document.getElementById("userIdInput").addEventListener("input", searchTimeline);
function fetchActivities() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(activities);
        }, 1000);
    });
}

async function loadActivities() {
    try {
        document.getElementById("liveActivities").innerHTML +=
            "<p>Loading activities...</p>";

        const data = await fetchActivities();

        console.log("Loaded Activities:", data);

        document.getElementById("liveActivities").innerHTML += `
            <h3>Activities Loaded Successfully</h3>
            <p>Total Activities: ${data.length}</p>
        `;

    } catch (error) {
        console.log("Error Loading Activities:", error);

        document.getElementById("liveActivities").innerHTML +=
            "<p>Unable to load activities.</p>";
    }
}

loadActivities();
const rules = [
    {
        type: "download",
        limit: 5,
        duration: 10 * 60 * 1000
    },
    {
        type: "failed_login",
        limit: 3,
        duration: 5 * 60 * 1000
    }
];

function detectAnomalies(activities, rules) {
    const anomalies = [];
    const grouped = groupActivitiesByUser(activities);

    grouped.forEach(function(userActivities, userId) {

        rules.forEach(function(rule) {

            const matchingActivities = userActivities
                .filter(function(activity) {
                    return activity.action === rule.type;
                })
                .sort(function(a, b) {
                    return new Date(a.timestamp) - new Date(b.timestamp);
                });

            for (let i = 0; i < matchingActivities.length; i++) {
                const startTime = new Date(matchingActivities[i].timestamp);

                const recentActivities = matchingActivities.filter(function(activity) {
                    const currentTime = new Date(activity.timestamp);

                    return currentTime >= startTime &&
                        currentTime <= new Date(startTime.getTime() + rule.duration);
                });

                if (recentActivities.length > rule.limit) {
                    anomalies.push({
                        userId: userId,
                        type: rule.type,
                        count: recentActivities.length,
                        limit: rule.limit,
                        timestamp: matchingActivities[i].timestamp
                    });

                    break;
                }
            }
        });
    });

    return anomalies;
}

const detectedAnomalies = detectAnomalies(activities, rules);

console.log("Rule-Based Anomalies:", detectedAnomalies);

document.getElementById("unusualActivities").innerHTML +=
    detectedAnomalies.map(function(item) {
        return `
            <div>
                <h3>Rule-Based Detection: ${item.type}</h3>
                <p>User ID: ${item.userId}</p>
                <p>Detected Count: ${item.count}</p>
                <p>Allowed Limit: ${item.limit}</p>
                <p>Time: ${item.timestamp}</p>
            </div>
            <hr>
        `;
    }).join("");
    function detectMultipleActiveSessions(activities) {
    const grouped = groupActivitiesByUser(activities);
    const multipleSessions = [];

    grouped.forEach(function(userActivities, userId) {
        const sortedActivities = [...userActivities].sort(function(a, b) {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        let activeSessions = 0;

        sortedActivities.forEach(function(activity) {
            if (activity.action === "login") {
                activeSessions++;

                if (activeSessions > 1) {
                    multipleSessions.push({
                        userId: userId,
                        type: "Multiple Active Sessions",
                        activeSessions: activeSessions,
                        timestamp: activity.timestamp
                    });
                }
            }

            if (activity.action === "logout" && activeSessions > 0) {
                activeSessions--;
            }
        });
    });

    return multipleSessions;
}

const multipleSessions = detectMultipleActiveSessions(activities);

console.log("Multiple Active Sessions:", multipleSessions);

document.getElementById("unusualActivities").innerHTML +=
    multipleSessions.map(function(item) {
        return `
            <div>
                <h3>${item.type}</h3>
                <p>User ID: ${item.userId}</p>
                <p>Active Sessions: ${item.activeSessions}</p>
                <p>Time: ${item.timestamp}</p>
            </div>
            <hr>
        `;
    }).join("");
        const currentMostActiveUser = getMostActiveUser();
    const currentSummary = getActivitySummary();
    const currentAverageSession = getAverageSessionDuration();
    const currentUserScore = getUserActivityScore(1);

    console.log("Updated Most Active User:", currentMostActiveUser);
    console.log("Updated Activity Summary:", currentSummary);
    console.log("Updated Average Session:", currentAverageSession);
    console.log("Updated User Score:", currentUserScore);

    document.getElementById("activitySummary").innerHTML = `
        <h3>Most Active User</h3>
        <p>User ID: ${currentMostActiveUser.userId}</p>
        <p>Total Activities: ${currentMostActiveUser.totalActivities}</p>

        <h3>Activity Summary</h3>
        <p>Total Activities: ${currentSummary.totalActivities}</p>
        <p>Total Users: ${currentSummary.totalUsers}</p>

        <h3>Action Counts</h3>
        ${Object.entries(currentSummary.actionCounts).map(function(item) {
            return `<p>${item[0]}: ${item[1]}</p>`;
        }).join("")}

        <h3>Average Session Duration</h3>
        <p>${currentAverageSession} minutes</p>

        <h3>User 1 Activity Score</h3>
        <p>${currentUserScore.activityScore}</p>
    `;
    