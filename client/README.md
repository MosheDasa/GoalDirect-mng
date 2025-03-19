# GoalDirect Client

ממשק המשתמש עבור מערכת ניהול טורניר הכדורגל GoalDirect.

## התקנה

1. התקן את Node.js (גרסה 14 ומעלה)
2. התקן את התלויות:
```bash
npm install
```

## פיתוח

כדי להריץ את האפליקציה במצב פיתוח:
```bash
npm start
```

## בנייה

כדי לבנות את האפליקציה:
```bash
npm run build
```

## בדיקות

כדי להריץ את הבדיקות:
```bash
npm test
```

## תכונות

- ניהול קבוצות ושחקנים
- ניהול משחקים ותוצאות
- טבלת דירוג מתעדכנת אוטומטית
- מעקב אחר כובשי השערים
- מערכת הודעות
- ייצוא דוחות

## טכנולוגיות

- React
- TypeScript
- Ant Design
1. התקן את Node.js (גרסה 14 ומעלה)
2. שכפל את המאגר:
   ```bash
   git clone https://github.com/your-username/goaldirect.git
   cd goaldirect/client
   ```
3. התקן את התלויות:
   ```bash
   npm install
   ```
4. הפעל את הפרויקט:
   ```bash
   npm start
   ```

## טכנולוגיות

- React 18
- TypeScript
- Ant Design
- React Router
- Axios

## מבנה הפרויקט

```
src/
  ├── components/     # רכיבים משותפים
  ├── pages/         # דפי האפליקציה
  ├── services/      # שירותי API
  ├── types/         # הגדרות TypeScript
  ├── utils/         # פונקציות עזר
  ├── App.tsx        # רכיב ראשי
  └── index.tsx      # נקודת כניסה
```

## פיתוח

- `npm start` - הפעלת שרת פיתוח
- `npm run build` - בניית גרסת ייצור
- `npm test` - הרצת בדיקות
- `npm run eject` - הוצאת קונפיגורציית React Scripts

## רישיון

MIT 