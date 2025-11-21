# 🚀 Production Deployment Checklist

**Project**: Dating Assistent App
**Last Updated**: 2025-01-04

Use this checklist before deploying to production. Check off each item as you complete it.

---

## 📋 PRE-DEPLOYMENT

### Environment Configuration

- [ ] **Environment variables configured in hosting platform**
  - [ ] `POSTGRES_URL` - Production database (pooled)
  - [ ] `POSTGRES_PRISMA_URL` - Production database (Prisma)
  - [ ] `POSTGRES_URL_NON_POOLING` - Production database (direct)
  - [ ] `JWT_SECRET` - New secret (64+ characters, different from dev)
  - [ ] `SENDGRID_API_KEY` - Production API key (starts with "SG.")
  - [ ] `OPENROUTER_API_KEY` - Production API key (optional)
  - [ ] `MULTISAFEPAY_API_KEY` - **LIVE** API key (not test!)
  - [ ] `NEXT_PUBLIC_MSP_TEST_MODE` - Set to `"false"`
  - [ ] `NEXT_PUBLIC_BASE_URL` - Production domain (https://yourdomain.com)
  - [ ] `NODE_ENV` - Set to `"production"`

- [ ] **Run environment check**: `npm run check-env`

- [ ] **Verify `.env.local` is NOT committed to git**
  ```bash
  git status --ignored
  # Should NOT see .env.local listed
  ```

### Code Quality

- [ ] **Run type checking**: `npm run typecheck`
  - Review and fix critical type errors
  - Document any remaining non-critical issues

- [ ] **Run linter**: `npm run lint`
  - Fix all critical linting errors
  - Address warnings where possible

- [ ] **Test build**: `npm run build`
  - Build must complete successfully
  - Review build output for warnings
  - Check bundle sizes (especially large pages)

- [ ] **Review security**
  - [ ] No API keys or secrets in code
  - [ ] No `console.log` statements with sensitive data
  - [ ] Rate limiting enabled on auth endpoints
  - [ ] Webhook validation implemented
  - [ ] Input validation on all user-facing forms

### Database

- [ ] **Production database ready**
  - [ ] Database created in Neon
  - [ ] Tables created (run migrations if needed)
  - [ ] Test connection from local machine
  - [ ] Backup strategy in place

- [ ] **Database migrations**
  - [ ] All migrations applied
  - [ ] Seed data if needed (courses, initial content)
  - [ ] No development data in production

### Third-Party Services

- [ ] **SendGrid**
  - [ ] Production API key obtained
  - [ ] Sender email verified
  - [ ] Email templates tested
  - [ ] Sending domain configured (optional but recommended)

- [ ] **MultiSafePay**
  - [ ] **CRITICAL**: Using LIVE API key (not test!)
  - [ ] Test mode disabled (`NEXT_PUBLIC_MSP_TEST_MODE="false"`)
  - [ ] Webhook URL configured: `https://yourdomain.com/api/payment/webhook`
  - [ ] Webhook tested with real transactions
  - [ ] Payment success/cancel URLs configured

- [ ] **OpenRouter (if used)**
  - [ ] Production API key
  - [ ] Usage limits understood
  - [ ] Budget alerts configured

### Testing

- [ ] **Manual testing completed**
  - [ ] User registration works
  - [ ] Login/logout works
  - [ ] Password reset works
  - [ ] Course access works for different membership tiers
  - [ ] Payment flow works (test with small amount first!)
  - [ ] Email delivery works

- [ ] **Payment testing** (CRITICAL!)
  - [ ] Test with real credit card (use your own)
  - [ ] Verify webhook is called
  - [ ] Verify order status updates in database
  - [ ] Verify user gets access after payment
  - [ ] Test cancel payment flow
  - [ ] Test expired payment scenario

### Security

- [ ] **Security headers enabled** (check `src/middleware.ts`)
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Strict-Transport-Security (HSTS)
  - [ ] Content-Security-Policy

- [ ] **Rate limiting active**
  - [ ] Auth endpoints limited (5 per 15 min)
  - [ ] Test rate limiting works (try 6 login attempts)

- [ ] **HTTPS enabled**
  - [ ] SSL certificate valid
  - [ ] All resources loaded over HTTPS
  - [ ] No mixed content warnings

---

## 🌐 DEPLOYMENT

### Pre-Deploy

- [ ] **Create git tag for release**
  ```bash
  git tag -a v1.0.0 -m "Production release 1.0.0"
  git push origin v1.0.0
  ```

- [ ] **Backup current production** (if updating existing deployment)

### Deploy

- [ ] **Deploy to hosting platform** (e.g., Vercel)
  ```bash
  vercel --prod
  # or
  git push origin main  # if auto-deploy is configured
  ```

- [ ] **Monitor deployment**
  - [ ] Build completes successfully
  - [ ] No errors in build logs
  - [ ] Deployment URL is correct

### Post-Deploy

- [ ] **Smoke testing** (test critical paths immediately)
  - [ ] Homepage loads
  - [ ] Can register new account
  - [ ] Can login
  - [ ] Can access courses
  - [ ] Payment page loads
  - [ ] Dashboard loads

- [ ] **Monitor for errors**
  - [ ] Check application logs (first 30 minutes)
  - [ ] Check error tracking (if using Sentry/similar)
  - [ ] Monitor database connections

- [ ] **Test from different devices**
  - [ ] Desktop browser
  - [ ] Mobile browser
  - [ ] Different browsers (Chrome, Firefox, Safari)

---

## 📊 POST-DEPLOYMENT MONITORING

### First 24 Hours

- [ ] **Monitor performance**
  - [ ] Page load times acceptable
  - [ ] API response times normal
  - [ ] Database queries performing well

- [ ] **Monitor errors**
  - [ ] No critical errors in logs
  - [ ] No failed payments
  - [ ] No failed email deliveries

- [ ] **Test real user flows**
  - [ ] Register a real test user
  - [ ] Make a real payment (refund if needed)
  - [ ] Test all membership tiers

### First Week

- [ ] **Review analytics**
  - [ ] User registrations tracking correctly
  - [ ] Payment conversions tracking
  - [ ] Error rates acceptable

- [ ] **Database maintenance**
  - [ ] Check database size
  - [ ] Review slow queries
  - [ ] Ensure backups are running

- [ ] **Security review**
  - [ ] No suspicious login attempts
  - [ ] Rate limiting working
  - [ ] No unauthorized access attempts

---

## 🆘 ROLLBACK PLAN

If critical issues are discovered:

1. **Immediate**: Roll back to previous deployment
   ```bash
   vercel rollback  # or your platform's rollback command
   ```

2. **Notify users** (if service is degraded)
   - Add status banner to site
   - Send email if needed

3. **Debug in staging/development**
   - Don't debug in production!
   - Fix issues locally
   - Test thoroughly
   - Re-deploy when fixed

---

## 📝 POST-DEPLOYMENT TASKS

- [ ] **Update documentation**
  - [ ] Update version number
  - [ ] Document any new features
  - [ ] Update API documentation if changed

- [ ] **Team notification**
  - [ ] Notify team of deployment
  - [ ] Share what changed
  - [ ] Note any breaking changes

- [ ] **Monitor user feedback**
  - [ ] Check support emails
  - [ ] Monitor social media
  - [ ] Check for bug reports

---

## 🎯 SUCCESS CRITERIA

Your deployment is successful when:

✅ No critical errors in logs (first 24 hours)
✅ Payment flow working correctly
✅ Users can register and login
✅ Email delivery working
✅ Page load times < 3 seconds
✅ No security incidents
✅ Database performing well
✅ All third-party integrations working

---

## 📞 EMERGENCY CONTACTS

- **Hosting**: [Your hosting platform support]
- **Database (Neon)**: [Neon support]
- **Payment (MultiSafePay)**: [MultiSafePay support]
- **Email (SendGrid)**: [SendGrid support]
- **Team Lead**: [Your contact]

---

## 📚 ADDITIONAL RESOURCES

- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables guide
- [README.md](./README.md) - Project documentation
- [MultiSafePay Docs](https://docs.multisafepay.com/)
- [Vercel Docs](https://vercel.com/docs) (if using Vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Remember**: It's better to delay deployment than to rush and have issues in production!

**Good luck! 🚀**
