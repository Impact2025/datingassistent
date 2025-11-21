# 🚀 Tool Completion Tracking - Quick Start Guide

**For Developers:** How to add progress tracking to your coaching tools

---

## 📝 5-Minute Integration

### Step 1: Import the Hook

```typescript
import { useToolCompletion } from '@/hooks/use-tool-completion';
```

### Step 2: Initialize in Your Component

```typescript
export function MyCoachingTool() {
  const {
    isActionCompleted,
    markCompleted,
    progress,
    loading
  } = useToolCompletion('my-tool-name');  // ← Your tool identifier

  // ... rest of component
}
```

### Step 3: Track Completions

```typescript
// When user completes an action
const handleAction = async () => {
  // ... do your logic ...

  // Mark as completed
  await markCompleted('action_name', {
    // Optional metadata
    score: 8.5,
    itemsProcessed: 10,
    timestamp: new Date().toISOString()
  });
};
```

### Step 4: Check Completion Status

```typescript
// Check if specific action is done
if (isActionCompleted('action_name')) {
  // Show "already completed" UI
}

// Show overall progress
<div>
  Progress: {progress.progressPercentage}%
  ({progress.completedActions}/{progress.totalActions} actions)
</div>
```

---

## 🎯 Valid Tool Names

Use these exact strings (case-sensitive):

- `'profiel-coach'` - Profile coaching tool
- `'foto-advies'` - Photo advice tool
- `'chat-coach'` - Chat coaching tool
- `'gesprek-starter'` - Conversation starters tool
- `'date-planner'` - Date planning tool

**Adding a new tool?** Update the validation in `/api/tool-completion/mark-completed/route.ts`

---

## 📊 Action Naming Convention

**Format:** `{action}_{past_tense}`

**Good Examples:**
- ✅ `bio_generated`
- ✅ `photo_uploaded`
- ✅ `analysis_viewed`
- ✅ `conversation_started`

**Bad Examples:**
- ❌ `generate-bio` (use underscore, not hyphen)
- ❌ `photoUpload` (use snake_case, not camelCase)
- ❌ `view_analysis` (use past tense: viewed)

---

## 💾 Metadata Best Practices

**DO:**
```typescript
await markCompleted('bio_generated', {
  bioLength: generatedBio.length,
  model: 'gpt-4',
  timestamp: new Date().toISOString(),
  userRating: 4.5
});
```

**DON'T:**
```typescript
await markCompleted('bio_generated', {
  fullBioText: generatedBio,  // ❌ Too much data
  userObject: user,            // ❌ Circular references
  privateKey: 'secret'         // ❌ Sensitive data
});
```

**Keep it:**
- Small (<1KB)
- JSON-serializable
- Non-sensitive
- Useful for analytics

---

## 🔍 Common Patterns

### Pattern 1: Track on Success

```typescript
try {
  const result = await generateBio(userData);
  setGeneratedBio(result);

  // Track AFTER success
  await markCompleted('bio_generated', {
    bioLength: result.length,
    timestamp: new Date().toISOString()
  });
} catch (error) {
  // Don't track on error
  console.error(error);
}
```

### Pattern 2: Conditional Completion

```typescript
const handlePhotoAnalysis = async () => {
  const score = await analyzePhoto(file);

  // Mark viewed
  await markCompleted('analysis_viewed', { score });

  // Mark improved only if score is better
  const previousBest = getBestScore();
  if (score > previousBest) {
    await markCompleted('photo_improved', {
      previousScore: previousBest,
      newScore: score,
      improvement: score - previousBest
    });
  }
};
```

### Pattern 3: Auto-Track with useEffect

```typescript
// Track when user switches tabs
useEffect(() => {
  if (activeTab === 'checklist') {
    markCompleted('checklist_viewed', {
      timestamp: new Date().toISOString()
    });
  }
}, [activeTab]);
```

### Pattern 4: Show Progress Bar

```typescript
return (
  <div>
    <h2>My Tool</h2>

    {/* Progress indicator */}
    {progress.completedActions > 0 && (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-600">
          {progress.progressPercentage}% voltooid
          ({progress.completedActions} acties)
        </span>
      </div>
    )}

    {/* Your tool UI */}
  </div>
);
```

---

## 🐛 Debugging

### Check Database Directly

```sql
-- See all completions for a user
SELECT * FROM tool_completions WHERE user_id = 123;

-- Check specific action
SELECT * FROM tool_completions
WHERE user_id = 123
AND tool_name = 'profiel-coach'
AND action_name = 'bio_generated';

-- View aggregated progress
SELECT * FROM tool_progress WHERE user_id = 123;

-- See overall progress
SELECT * FROM user_coaching_progress WHERE user_id = 123;
```

### Check API Response

```bash
# Mark completion
curl -X POST http://localhost:3000/api/tool-completion/mark-completed \
  -H "Content-Type: application/json" \
  -H "Cookie: datespark_auth_token=YOUR_TOKEN" \
  -d '{
    "toolName": "profiel-coach",
    "actionName": "bio_generated",
    "metadata": {"bioLength": 250}
  }'

# Get progress
curl http://localhost:3000/api/tool-completion/progress?toolName=profiel-coach \
  -H "Cookie: datespark_auth_token=YOUR_TOKEN"

# Check if completed
curl "http://localhost:3000/api/tool-completion/is-completed?toolName=profiel-coach&actionName=bio_generated" \
  -H "Cookie: datespark_auth_token=YOUR_TOKEN"
```

### Browser Console

```javascript
// Check if hook is working
console.log('Progress:', progress);
console.log('Loading:', loading);
console.log('Error:', error);

// Manually trigger completion (for testing)
await markCompleted('test_action', { test: true });
```

---

## ⚡ Performance Tips

1. **Don't track too frequently**
   ```typescript
   // ❌ Bad: Track on every keystroke
   onChange={(e) => markCompleted('typing', { length: e.target.value.length })}

   // ✅ Good: Track on save/submit
   onSubmit={() => markCompleted('bio_saved', { length: bio.length })}
   ```

2. **Use debouncing for auto-save**
   ```typescript
   const debouncedSave = useMemo(
     () => debounce(async (data) => {
       await saveToDB(data);
       await markCompleted('auto_saved', { size: data.length });
     }, 1000),
     []
   );
   ```

3. **Check completion before expensive operations**
   ```typescript
   if (isActionCompleted('heavy_computation')) {
     // Skip if already done
     return cachedResult;
   }

   const result = await heavyComputation();
   await markCompleted('heavy_computation', { duration: Date.now() - start });
   ```

---

## 🔒 Security Notes

**Always:**
- Use authenticated API calls (hook handles this)
- Validate user owns the data they're tracking
- Never store sensitive data in metadata
- Sanitize user input before storing

**Never:**
- Bypass authentication
- Store passwords/tokens in metadata
- Allow tracking for other users
- Trust client-side completion status alone

---

## 📚 Full API Reference

### `useToolCompletion(toolName: string)`

**Returns:**
```typescript
{
  // Check if specific action is completed
  isActionCompleted: (actionName: string) => boolean;

  // Mark action as completed with optional metadata
  markCompleted: (actionName: string, metadata?: object) => Promise<void>;

  // Current progress for this tool
  progress: {
    completedActions: number;
    actionsCompleted: string[];
    progressPercentage: number;
    totalActions: number;
  };

  // Loading state (true during API calls)
  loading: boolean;

  // Error object if something went wrong
  error: Error | null;
}
```

**Example:**
```typescript
const { isActionCompleted, markCompleted, progress, loading, error } =
  useToolCompletion('profiel-coach');

// Check completion
if (isActionCompleted('bio_generated')) {
  console.log('Bio already generated!');
}

// Mark completed
await markCompleted('bio_generated', {
  bioLength: 250,
  timestamp: new Date().toISOString()
});

// Show progress
console.log(`Progress: ${progress.progressPercentage}%`);
console.log(`Completed: ${progress.completedActions}/${progress.totalActions}`);
console.log(`Actions: ${progress.actionsCompleted.join(', ')}`);
```

---

## 🎓 Advanced Usage

### Custom Progress Logic

```typescript
const { progress, markCompleted } = useToolCompletion('profiel-coach');

// Define your tool's action sequence
const ACTION_SEQUENCE = [
  'step1_completed',
  'step2_completed',
  'step3_completed',
  'final_review'
];

// Calculate custom progress
const customProgress = useMemo(() => {
  const completed = ACTION_SEQUENCE.filter(action =>
    progress.actionsCompleted.includes(action)
  );

  return {
    current: completed.length,
    total: ACTION_SEQUENCE.length,
    percentage: (completed.length / ACTION_SEQUENCE.length) * 100,
    nextStep: ACTION_SEQUENCE.find(action =>
      !progress.actionsCompleted.includes(action)
    )
  };
}, [progress]);

return (
  <div>
    <p>Step {customProgress.current} of {customProgress.total}</p>
    <p>Next: {customProgress.nextStep}</p>
  </div>
);
```

### Multi-Tool Progress

```typescript
// Track progress across multiple tools
const profielProgress = useToolCompletion('profiel-coach');
const fotoProgress = useToolCompletion('foto-advies');
const chatProgress = useToolCompletion('chat-coach');

const overallProgress = useMemo(() => {
  const total =
    profielProgress.progress.progressPercentage +
    fotoProgress.progress.progressPercentage +
    chatProgress.progress.progressPercentage;

  return Math.round(total / 3);
}, [profielProgress, fotoProgress, chatProgress]);

return <p>Overall completion: {overallProgress}%</p>;
```

### Achievement Unlocking

```typescript
const { progress, markCompleted } = useToolCompletion('profiel-coach');

useEffect(() => {
  // Unlock achievement at 100%
  if (progress.progressPercentage === 100) {
    unlockAchievement('profile_master');
    showConfetti();
  }

  // Unlock milestone achievements
  if (progress.progressPercentage >= 50 && !hasAchievement('halfway_there')) {
    unlockAchievement('halfway_there');
  }
}, [progress.progressPercentage]);
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `isActionCompleted()` always returns false | Check action name spelling, check DB for user_id |
| Progress not updating after `markCompleted()` | Check network tab, verify auth token, check API response |
| TypeScript errors | Import types from hook file |
| Performance slow | Add database indexes, check for N+1 queries |
| Data not persisting | Check database connection, verify API endpoint |

---

## 📞 Need Help?

1. Check this guide first
2. Review SPRINT_2_MIGRATION_COMPLETE.md
3. Look at existing tool implementations:
   - `src/components/dashboard/profiel-coach-tab.tsx`
   - `src/components/dashboard/foto-advies-tab.tsx`
4. Check API endpoint code: `src/app/api/tool-completion/`
5. Review hook implementation: `src/hooks/use-tool-completion.ts`

---

**Happy tracking! 🎯**

*Last updated: 17 November 2025*
*Sprint 2 Database Migration*
