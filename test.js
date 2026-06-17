async function test() {
  const res = await fetch('http://localhost:3000/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      sheet: 'Posts',
      data: { id: 'test', title: 'test' }
    })
  });
  console.log('Status:', res.status);
  const data = await res.text();
  console.log('Response:', data);
}
test();
