
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendApprovalEmail = async ({ to, name, salary }) => {
  await transporter.sendMail({
    from: `"TaskFlow HR" <${process.env.SMTP_USER}>`,
    to,
    subject: '🎉 Your Account Has Been Approved — Welcome to TaskFlow!',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">Welcome to TaskFlow! 🚀</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:16px;">Your employee account has been approved</p>
        </div>
        <div style="background:#fff;padding:40px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <p style="font-size:16px;color:#333;">Hi <strong>${name}</strong>,</p>
          <p style="font-size:15px;color:#555;line-height:1.6;">Your registration has been <strong style="color:#22c55e;">approved</strong>! You can now log in to your TaskFlow account.</p>
          ${salary ? `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:24px 0;">
            <p style="margin:0;font-size:15px;color:#166534;">💰 Your monthly salary: <strong style="font-size:18px;">₹${Number(salary).toLocaleString('en-IN')}</strong></p>
          </div>` : ''}
          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;">Login to TaskFlow →</a>
          </div>
        </div>
      </div>`
  });
};

const sendRejectionEmail = async ({ to, name }) => {
  await transporter.sendMail({
    from: `"TaskFlow HR" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your TaskFlow Registration Status',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#ef4444;padding:40px 32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Registration Update</h1>
        </div>
        <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #fee2e2;">
          <p style="font-size:16px;color:#333;">Hi <strong>${name}</strong>,</p>
          <p style="font-size:15px;color:#555;line-height:1.6;">After reviewing your registration, we regret that your account application could not be approved at this time. Please contact HR for more information.</p>
        </div>
      </div>`
  });
};

const sendTaskAssignedEmail = async ({ to, employeeName, task }) => {
  const priorityColors = { Minor:'#22c55e', Medium:'#3b82f6', Major:'#f59e0b', Critical:'#ef4444' };
  const color = priorityColors[task.task_priority] || '#3b82f6';

  await transporter.sendMail({
    from: `"TaskFlow" <${process.env.SMTP_USER}>`,
    to,
    subject: `📋 New Task Assigned: ${task.title}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:36px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">New Task Assigned 📋</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;">You have a new task waiting for you</p>
        </div>
        <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <p style="font-size:16px;color:#333;">Hi <strong>${employeeName}</strong>,</p>
          <div style="background:#f8fafc;border-left:4px solid ${color};border-radius:8px;padding:24px;margin:20px 0;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">${task.title}</h2>
            <p style="margin:0 0 16px;color:#64748b;font-size:14px;">${task.description}</p>
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#64748b;width:140px;">Priority</td>
                <td><span style="background:${color}20;color:${color};padding:3px 10px;border-radius:20px;font-weight:700;">${task.task_priority}</span></td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Due Date</td>
                <td style="font-weight:600;">${task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Est. Hours</td>
                <td style="font-weight:600;">${task.estimated_hours} hrs</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Time Given</td>
                <td style="font-weight:600;">${task.time_given} hrs</td></tr>
            </table>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;">View Task in Dashboard →</a>
          </div>
        </div>
      </div>`
  });
};

// ── NEW: sent to employee when they update task status ────────────────────────
const sendTaskStatusUpdateEmail = async ({ to, employeeName, task, oldStatus }) => {
  const statusColors = {
    'pending':     '#94a3b8',
    'in progress': '#3b82f6',
    'on-hold':     '#f59e0b',
    'cancelled':   '#ef4444',
    'completed':   '#22c55e'
  };
  const newColor = statusColors[task.status] || '#6366f1';
  const oldColor = statusColors[oldStatus]   || '#94a3b8';

  await transporter.sendMail({
    from: `"TaskFlow" <${process.env.SMTP_USER}>`,
    to,
    subject: `🔄 Task Status Updated: ${task.title}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:36px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Task Status Updated 🔄</h1>
          <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:14px;">Your update has been recorded</p>
        </div>
        <div style="background:#fff;padding:36px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
          <p style="font-size:15px;color:#333;">Hi <strong>${employeeName}</strong>,</p>
          <p style="font-size:14px;color:#64748b;">You've updated the status of the following task:</p>

          <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0;">
            <p style="font-weight:700;font-size:17px;color:#1e293b;margin:0 0 16px;">${task.title}</p>

            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
              <div style="text-align:center;">
                <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Previous</div>
                <span style="background:${oldColor}20;color:${oldColor};padding:5px 14px;border-radius:20px;font-weight:700;font-size:13px;display:inline-block;">${oldStatus}</span>
              </div>
              <div style="font-size:20px;color:#94a3b8;">→</div>
              <div style="text-align:center;">
                <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">New Status</div>
                <span style="background:${newColor}20;color:${newColor};padding:5px 14px;border-radius:20px;font-weight:700;font-size:13px;display:inline-block;">${task.status}</span>
              </div>
            </div>
          </div>

          ${task.status === 'completed' ? `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;text-align:center;margin:16px 0;">
            <p style="margin:0;color:#166534;font-weight:700;">🎉 Great work on completing the task!</p>
          </div>` : ''}

          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display:inline-block;background:#1e293b;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:700;">Open Dashboard →</a>
          </div>
          <p style="font-size:12px;color:#94a3b8;">Updated on ${new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</p>
        </div>
      </div>`
  });
};

module.exports = { sendApprovalEmail, sendRejectionEmail, sendTaskAssignedEmail, sendTaskStatusUpdateEmail };