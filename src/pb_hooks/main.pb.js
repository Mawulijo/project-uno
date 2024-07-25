/// <reference path="../../../pocketbase/pocketbase_0.21.3_darwin_arm64/pb_data/types.d.ts" />

onRecordAfterCreateRequest((e) => {
    const message = new MailerMessage({
        from: {
            address: $app.settings().meta.senderAddress,
            name:    $app.settings().meta.senderName,
        },
        to:      [{address: e.record.email()}],
        subject: "You've been invited to a Team",
        html:    "Welcome buddy...",
        // bcc, cc and custom headers are also supported...
    })

    $app.newMailClient().send(message)
}, "invites")


// before because otherwise also updated changes
onRecordBeforeUpdateRequest((e) => {
    const parse = (obj) => JSON.parse(JSON.stringify(obj));

    const original = parse(e.record?.originalCopy());
    const updated = parse(e.record?.cleanCopy());

    let changed = []
    for (const key in original) {
        if (original[key] !== updated[key]) {
            changed.push(key === "username" ? "email" : key)
        }
    }

    const message = new MailerMessage({
        from: {
            address: $app.settings().meta.senderAddress,
            name:    $app.settings().meta.senderName,
        },
        to:      [{address: e.record.email()}],
        subject: "You updated your profile!",
        html:    `<p>Hello,<br>you updated the following properties of your user profile: ${changed.toString()}`
    })

    $app.newMailClient().send(message)
}, "users")