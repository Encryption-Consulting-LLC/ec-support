---
title: "CBOM Secure Deployment and Installation Troubleshooting FAQ"
category: "Products"
section: "CBOM Secure"
article_type: "Troubleshooting"
applies_to: "CBOM Secure server installation, upgrades, and discovery agent deployment (on-premises, cloud, and hybrid)"
summary: "Troubleshooting for CBOM Secure before, during, and after installation and agent deployment: prerequisites, failed installs, first login, agents that report success but send nothing, and what to send EC support."
keywords: ["CBOM Secure troubleshooting", "CBOM Secure installation problems", "agent deployment failed", "CBOM Secure install errors", "discovery agent no results"]
last_reviewed: "2026-10-07"
---

# CBOM Secure Deployment and Installation Troubleshooting FAQ

This article covers the problems most often seen before, during, and after a CBOM Secure installation, and when deploying discovery agents to target hosts. It is for administrators installing or upgrading CBOM Secure and for support staff triaging a failed deployment.

Each section is ordered the way a deployment runs: prerequisites, install, first login, agent deployment, then scanning. Work through the section that matches where the problem appeared.

## The one failure to know about first

**The most common serious problem does not report an error.** A deployment can finish, the agent can install, the scan can run to completion, and no results ever arrive, with every status in the console showing success.

Almost always the cause is the same. During installation, CBOM Secure asks for the address that *target machines* use to reach the server. If that answer is `localhost`, `127.0.0.1`, or an internal container name, then every agent resolves it on its own machine, finds nothing there, and writes its findings to a local file instead. Nothing errors anywhere.

If findings are missing and no component reports a failure, check that address first. See [The agent runs and finds nothing, or delivers nothing](#the-agent-runs-and-finds-nothing-or-delivers-nothing).

## Before you install

### What should be ready before starting?

| Item | Requirement |
|---|---|
| Server operating system | A clean Debian or Ubuntu server. Other distributions: {{TBD: full supported server operating system matrix}} |
| Privileges | Root, or a user with `sudo` |
| Free disk | 20 GB or more for a full bundle install; 10 GB for a container-only install |
| Free memory | 4 GB or more |
| Free ports on the server | 80 and 443 for the web console, plus the broker port for agents |
| Network | Access to the package repositories and container registry, unless installing from an offline bundle |

> **Do not install onto a machine that already runs MongoDB natively.** The installer binds the standard MongoDB port and the two will collide. Stop the existing MongoDB first, or choose another host.

### Which ports need to be open?

| From | To | Port | Purpose |
|---|---|---|---|
| Administrator browser | CBOM Secure server | 443 | Web console |
| Discovery agent on a target host | CBOM Secure server | 5672 | Sending findings over the message broker |
| Discovery agent on a target host | CBOM Secure server | 443 | Agent registration and fallback submission |
| CBOM Secure server | Linux target host | 22 | Agent deployment over SSH |
| CBOM Secure server | Windows target host | 5985 or 5986 | Agent deployment over WinRM |
| CBOM Secure server | Windows target host | 445 | File transfer over SMB |
| Agent host | Each scan source | Varies | For example HSM, database, or Git server |

Direct database access from an administrator workstation is not required and should not be opened. Where a direct database connection is genuinely needed, tunnel it over SSH rather than exposing the port.

### The installer fails a preflight check. What is it telling me?

Preflight failures are deliberate. Each one stops an install that would otherwise appear to succeed and leave a broken system behind.

| Check | Meaning | Resolution |
|---|---|---|
| Disk space below threshold | The install would run out part-way | Free space, or choose another host |
| Sensor set is empty | The installation bundle was built without its sensor content, and would install a product that can scan nothing | Rebuild the bundle from a complete source checkout |
| Required value missing | A mandatory setting, such as the dashboard administrator password, was left blank | Supply the value. The stack refuses to start without it |

## During installation

### The installer stopped part-way. Can I just run it again?

It depends on how far it got, and there is no resume.

- **If no services have started yet,** nothing permanent exists. Re-run the installer and answer the prompts again. Regenerated passwords are safe, because nothing has used the previous ones.
- **If services have already started,** some state is written once and never revisited, notably the identity realm and the configuration record. Re-running leaves that state holding the *first* run's answers, which is how a deployment ends up pointing at the wrong address with nothing explaining why. Reset the installation properly and start again, rather than re-running over it.

Ask EC support before resetting a system that already holds discovered data. A full reset destroys the inventory.

### Which installation answers matter most?

Most prompts have a safe default. Four deserve thought.

1. **The address target machines use to reach this server.** This is written into every agent configuration and resolved on the target machine, not on the server. A loopback address or an internal container name means each agent looks for the server on itself. Give the address a scanned machine can genuinely reach.
2. **Database network exposure.** Keep the default. Exposing the database puts the entire inventory behind only the database password.
3. **AI assistant provider.** Optional. The service installs either way. Without a provider key the assistant pages load but questions fail until a key is set in System Configuration.
4. **Administrator and dashboard passwords.** These are displayed once, at the end of the install. Record them before closing the session.

### The install finished. How do I confirm it actually worked?

The installer runs its own checks and should report that all of them passed. Then confirm three more things, each of which fails quietly:

- **The configuration record exists.** Without it, the System Configuration page cannot load or be saved.
- **An ingestion worker is attached to the findings queue.** A queue with no worker accepts findings and never processes them, so scans appear to succeed while the inventory stays empty.
- **The starter tag scopes loaded.** If they report a missing seed file, the installation data did not load completely.

Then open the console and check that the sidebar shows all seven sections (Dashboard, Discovery, Reports, Insights, Crypto Inventory, Governance, and Administration), and that System Configuration opens and can be saved.

EC support can supply the exact commands for these checks for your installation type.

### The web console loads but every action fails

The console receives its server addresses when its container starts, not when it is built. If those addresses were never filled in, the page renders and every request goes nowhere.

| What the console is pointed at | Meaning |
|---|---|
| A placeholder address | The runtime values were never substituted. The service was started incorrectly |
| A loopback address | The wrong answer was given during installation |
| The correct address, but requests still fail | Look at TLS trust and the reverse proxy instead |

### I edited a configuration file and my change disappeared

This is expected, and it applies in two separate places.

- **Service configuration files are generated, not authored.** CBOM Secure rewrites them from its stored configuration on every save, activation, and restart. A section added by hand is deleted the next time configuration is saved, and nothing reports the loss. Make the change in **System Configuration** in the console instead.
- **The container definition file is replaced on every install run.** Settings belong in the environment file the installer generates, not in the container definition.

If a setting has no control in System Configuration, open a support case rather than editing a file. Some settings are deliberately not exposed.

## After installation: first login and access

### I cannot sign in as the administrator

| Symptom | Likely cause | Resolution |
|---|---|---|
| Credentials rejected | The one-time administrator password was not recorded | Recover it from the environment file on the server, or re-run the administrator bootstrap step |
| Sign-in page does not load | The identity service has not finished starting, or its realm did not import | Check the identity service. A realm imports on first start only |
| Sign-in succeeds, then returns to the login page | The console and the identity service disagree about the public address | Confirm both use the same externally reachable hostname |
| A single sign-on button does nothing | The identity provider alias or its redirect address is wrong | Check the provider configuration under Administration |

### A user can sign in but cannot see or do what they should

CBOM Secure ships four roles: `admin`, `user`, `manager`, and `auditor`. Permissions are edited on the Roles and Permissions page under Administration.

Permissions are enforced on the server, not only in the interface. Removing a permission genuinely blocks the underlying request rather than merely hiding a button. So if a user reports that an action *fails* instead of being hidden, that is working as intended. Grant the permission rather than reporting a fault.

Two behaviors worth knowing:

- A role change takes effect on the user's current session. They do not need to sign out and back in.
- Administrators always keep the permissions needed to manage permissions. That floor cannot be removed, so an administrator cannot accidentally lock everyone out of the page that would undo the mistake.

### Visibility of the audit trail looks wrong

Audit visibility is enforced on the server and is not configurable per user.

| Role | Sees |
|---|---|
| `admin`, `auditor` | Every record |
| `manager` | Everything except audit-domain records |
| `user` | Only their own actions |

A user reporting that they cannot see all the audit records is seeing the intended behavior.

## Deploying a discovery agent to a target host

### The deployment cannot connect to the target

| Symptom | Likely cause | Resolution |
|---|---|---|
| Connection refused or timeout, Linux target | SSH not running, or port 22 blocked | Start SSH, open the port, and test reachability from the server |
| Connection refused or timeout, Windows target | Remote management not enabled | Enable PowerShell remoting on the target and allow it through the firewall |
| Authentication fails | Wrong credentials, or an account lockout from earlier attempts | Re-enter credentials and check the directory for a lockout |
| File transfer fails, Windows target | SMB (port 445) blocked | Open the port, or deploy the agent manually |
| Host unreachable but responds to ping | A host firewall allowing ICMP and nothing else | Test the specific TCP port, not ping |

> Ping is not a valid reachability test here. A host can answer ping and still refuse every port the deployment needs.

### The deployment reports success but no agent is running

Treat a reported success with no agent as a failure of the deployment, not of the agent.

Check, in order:

1. **Is the agent actually present on the target host?** Look for the installation directory and the service or scheduled task.
2. **Did extraction succeed?** A locked or partially transferred package can fail to unpack while the deployment step still exits cleanly.
3. **Is antivirus or application control removing it?** A freshly written executable on a Windows target is a common quarantine candidate. Check the endpoint protection logs on the target and allow-list the installation directory.
4. **Did the agent build include everything it needs?** An agent built on a host that was missing a required component installs and runs but cannot deliver results. See the next question.

### The agent runs and finds nothing, or delivers nothing

This is the quiet failure described at the top of this article. Work through it in this order.

1. **Confirm the agent-facing addresses.** In System Configuration, check both the broker address and the collector address that agents are given. Neither may be a loopback address or an internal container name. This is by far the most common cause.
2. **Confirm the broker port is reachable from the target host,** not from the server. Test outbound from the target itself.
3. **Read the agent's own log on the target machine.** When the agent cannot reach the server it records the failure there and saves the findings locally to retry. Those saved findings are recoverable, so nothing is lost yet.
4. **Confirm the agent build is complete.** An agent built on a host missing a delivery component scans correctly and then has no way to send anything. The scan looks perfect and the inventory stays empty. Rebuild the agent on a correctly prepared build host.
5. **Confirm an ingestion worker is running** on the CBOM Secure server. Findings that arrive with no worker attached stay queued.

### Scans used to work and have now stopped

| Symptom | Likely cause | Resolution |
|---|---|---|
| All agents stopped at once | The broker, the ingestion worker, or the server is down | Check the server before looking at any agent |
| One agent stopped | Credential expiry, a certificate change, or the target host was rebuilt | Re-deploy that agent |
| Deliveries fail after a security change | The broker was moved to an encrypted listener while deployed agents still use the plain one | Agents and server must change together. Contact EC support before changing broker transport settings |
| Results arrive but are hours old | A backlog is being worked through | Add ingestion workers, and check whether a scan scope grew sharply |

## During and after a scan

### The scan is much slower than expected

Large source repositories and binary-heavy file systems dominate scan time. Narrow the scope, split sources across more agents, or scan in parallel. Source-code scanning of a very large repository is the usual cause.

### The source-code scan reports nothing for a language I use

CBOM Secure's source-code scanner covers 15 languages, counting dialects. If a language is covered but produces no findings, the usual causes are:

| Symptom | Likely cause | Resolution |
|---|---|---|
| No findings in any language | Wrong branch or path, or the whole tree was excluded | Check the branch and the exclusion patterns |
| No findings in one language only | That language's parser component is missing from the agent build | Rebuild the agent with the full dependency set |
| Test code dominates the findings | Test trees are in scope | Exclude test directories. This also improves accuracy elsewhere |
| A finding names no algorithm | The algorithm is selected at runtime and cannot be determined from the source | Expected. The finding is still recorded, with the source expression captured |

### The inventory shows far fewer assets than expected

| Symptom | Likely cause | Resolution |
|---|---|---|
| An HSM or key manager shows too few keys | The credential's role cannot list all objects, or the wrong partition or slot was given | Use a role that can list all objects, and confirm the partition |
| A cloud account shows nothing | Missing list or describe permissions | Grant read permissions. A denied call returns nothing rather than an error |
| A keystore shows certificates but no keys | No password was supplied, so only public entries could be listed | Supply the keystore password. Only metadata is read |
| Everything from one host is missing | That host's scan never delivered | See [The agent runs and finds nothing, or delivers nothing](#the-agent-runs-and-finds-nothing-or-delivers-nothing) |

### The risk bands do not match what I expected

CBOM Secure rates each asset against each applicable criterion on a four-band scale.

| Band | Meaning |
|---|---|
| **Critical** | Fails outright |
| **High** | Insufficient margin |
| **Low** | Sound, but not the target state |
| **Safe** | Meets the target state |

An asset that does not carry enough information to judge a given criterion is reported as **No Analysis** rather than being guessed at.

> **There is no "Medium" on this scale.** "Medium" appears in two other places that use different scales for different purposes: the combined per-host score, and source-code finding severity. A Medium on a host chart is not a contradiction.

If an algorithm shows as unrated, the record usually does not name it precisely enough to match. An elliptic curve algorithm recorded without its curve is the common case. Two curves at the same key size can carry very different ratings, so CBOM Secure declines to guess rather than fabricate a rating. Report the example to EC support so the pattern can be added.

## Hosts with no network path (off-grid)

Hosts with no route to CBOM Secure are handled with a manual bundle rather than a deployed agent. The bundle is built in the console, carried to the host on removable media, run there, and the results file is carried back and imported.

| Symptom | Likely cause | Resolution |
|---|---|---|
| A normal deployment to the host is rejected | The host is registered as off-grid, which cannot be pushed to | Build a bundle for it instead |
| The bundle will not run on the target | Built for the wrong platform | Rebuild for the target's operating system and architecture |
| The import is rejected | The results do not match the task that produced them, or the file was altered in transit | Re-import the original file. Results are bound to their originating task so they cannot be replayed or tampered with |
| The import succeeds but no materials appear | Processing has not run yet | Allow the deduplication pass to run, then check again |

## Collecting information for a support case

Send the following with a deployment or installation case:

- What was being done, and the exact point at which it failed
- Whether the failure was reported, or whether everything reported success
- The server version and installation type
- The target host's operating system, for an agent problem
- The error text shown in the console, copied rather than described
- Server service logs covering the window around the failure
- The agent's own log from the target host, for an agent problem
- For a results problem: the source type, the agent name, the time of the scan, and what was expected against what appeared

**Never send passwords, tokens, keystore passwords, or private keys.** EC support does not need them. Credentials held by CBOM Secure are stored encrypted, and its log output is redacted before it is written. Exports and screenshots assembled by hand are not, so review anything prepared manually before sending it. Where a file must be shared, use [Secure file sharing with EC support](../../00-Working-with-EC-Support/secure-file-sharing-with-ec-support.md).

See also [What to include in a support case](../../00-Working-with-EC-Support/what-to-include-in-a-support-case.md), [Collecting diagnostic logs for EC products](../../00-Working-with-EC-Support/collecting-diagnostic-logs-for-ec-products.md), and [How to open a support case](../../00-Working-with-EC-Support/how-to-open-a-support-case.md).

## Related articles

- [Running a first cryptographic scan](running-a-first-cryptographic-scan.md)
- [CBOM Secure supported scan sources](cbom-secure-supported-scan-sources.md)
- [How CBOM Secure works](how-cbom-secure-works.md)
- [Reading a CBOM report](reading-a-cbom-report.md)
- [CBOM Secure FAQ](cbom-secure-faq.md)
- [CBOM Secure overview](cbom-secure-overview.md)
