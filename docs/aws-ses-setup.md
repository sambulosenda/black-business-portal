# AWS SES Setup Guide for BeautyPortal

This guide will help you set up AWS Simple Email Service (SES) for sending emails from BeautyPortal.

## Prerequisites

- AWS Account
- Domain name (for production use)
- AWS IAM user with SES permissions

## Step 1: Configure AWS SES

### 1.1 Access AWS SES Console

1. Log in to [AWS Console](https://console.aws.amazon.com)
2. Navigate to Simple Email Service (SES)
3. Choose your region (recommended: `us-east-1` for better deliverability)

### 1.2 Verify Your Email/Domain

#### For Development (Quick Start):

1. Go to "Verified identities" → "Create identity"
2. Choose "Email address"
3. Enter your email and click "Create identity"
4. Check your email and click the verification link

#### For Production (Domain Verification):

1. Go to "Verified identities" → "Create identity"
2. Choose "Domain"
3. Enter your domain (e.g., `beautyportal.com`)
4. Add the provided DNS records to your domain:
   - DKIM records (3 CNAME records)
   - Domain verification record (1 TXT record)
5. Wait for verification (usually 24-72 hours)

### 1.3 Request Production Access

By default, SES is in sandbox mode (can only send to verified emails).

1. Go to "Account dashboard"
2. Click "Request production access"
3. Fill out the form:
   - Use case: Transactional
   - Website URL: Your domain
   - Describe: "Email verification and booking confirmations for beauty service platform"
4. Submit and wait for approval (usually 24 hours)

## Step 2: Create IAM User for SES

### 2.1 Create Policy

1. Go to IAM → Policies → Create policy
2. Use this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}
```

3. Name it: `BeautyPortalSESPolicy`

### 2.2 Create IAM User

1. Go to IAM → Users → Add users
2. Username: `beautyportal-ses`
3. Select "Programmatic access"
4. Attach the `BeautyPortalSESPolicy`
5. Save the Access Key ID and Secret Access Key

## Step 3: Configure BeautyPortal

### 3.1 Update Environment Variables

Add to your `.env` file:

```env
# AWS SES Configuration
AWS_SES_REGION="us-east-1"
EMAIL_FROM="BeautyPortal <noreply@yourdomain.com>"
ENABLE_EMAIL_SENDING="true"

# If using different credentials for SES (optional)
# AWS_ACCESS_KEY_ID=your-ses-access-key
# AWS_SECRET_ACCESS_KEY=your-ses-secret-key
```

### 3.2 Test Email Sending

1. Start your development server
2. Sign up with a verified email address
3. Check the console for "✅ Email sent via AWS SES"
4. Verify you received the email

## Step 4: Monitor and Maintain

### 4.1 Set Up SNS for Bounces/Complaints

1. In SES Console → Configuration sets → Create
2. Name: `beautyportal-config`
3. Add event destination:
   - Events: Bounce, Complaint
   - Destination: SNS topic
   - Create topic: `beautyportal-email-events`

### 4.2 Update Email Service

In `src/lib/email.ts`, add configuration set:

```typescript
const command = new SendEmailCommand({
  // ... existing config
  ConfigurationSetName: 'beautyportal-config',
})
```

### 4.3 Monitor Dashboard

- Check SES → Reputation dashboard regularly
- Keep bounce rate < 5%
- Keep complaint rate < 0.1%

## Troubleshooting

### Common Issues:

1. **"Email address is not verified"**
   - You're in sandbox mode
   - Verify recipient email or request production access

2. **"Could not connect to SES"**
   - Check AWS credentials
   - Verify region is correct
   - Check IAM permissions

3. **Emails going to spam**
   - Complete domain verification with DKIM
   - Add SPF record: `"v=spf1 include:amazonses.com ~all"`
   - Warm up sending gradually

### Testing Commands:

```bash
# Test SES connection
aws ses get-send-quota --region us-east-1

# Send test email
aws ses send-email \
  --from noreply@yourdomain.com \
  --to test@example.com \
  --subject "Test" \
  --text "Test email" \
  --region us-east-1
```

## Cost Optimization

- First 62,000 emails/month from EC2: FREE
- After that: $0.10 per 1,000 emails
- No monthly fees or upfront costs
- Consider using configuration sets to track metrics

## Security Best Practices

1. Use IAM roles in production (not access keys)
2. Enable MFA on AWS account
3. Rotate access keys regularly
4. Monitor CloudTrail for unusual activity
5. Set up billing alerts

## Next Steps

1. Set up DMARC record for better deliverability
2. Create email templates for consistent branding
3. Implement bounce/complaint handling
4. Set up CloudWatch alarms for failures
5. Consider using SES event publishing for analytics

---

For more information, see [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
