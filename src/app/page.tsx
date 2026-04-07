export default function TestPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#364F6B', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', margin: '0' }}>안녕! 북카페 테스트 📚</h1>
        <p style={{ opacity: 0.8 }}>이 화면이 보인다면 배포 시스템은 정상입니다!</p>
      </div>
    </div>
  );
}
