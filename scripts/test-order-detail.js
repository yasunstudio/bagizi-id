/**
 * Test Order Detail API Response
 * Run: node test-order-detail.js [orderId]
 */

const orderId = process.argv[2] || 'clwl4a2r40000xhy93gtzgb5y'
const API_BASE = 'http://localhost:3000'

async function testOrderDetail() {
  console.log('🧪 Testing Order Detail API...\n')
  console.log(`Order ID: ${orderId}\n`)

  try {
    // Test GET /api/sppg/procurement/orders/[id]
    console.log(`📡 GET ${API_BASE}/api/sppg/procurement/orders/${orderId}`)
    
    const response = await fetch(`${API_BASE}/api/sppg/procurement/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real browser, session cookie will be included automatically
      },
    })

    console.log(`Status: ${response.status} ${response.statusText}`)
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('\n✅ SUCCESS')
      console.log('\nOrder Data:')
      console.log(JSON.stringify(data, null, 2))
      
      if (data.success && data.data) {
        const order = data.data
        console.log('\n📊 Order Summary:')
        console.log(`- Code: ${order.procurementCode}`)
        console.log(`- Status: ${order.status}`)
        console.log(`- Supplier: ${order.supplierName || 'N/A'}`)
        console.log(`- Items: ${order.items?.length || 0}`)
        console.log(`- Total: Rp ${order.totalAmount?.toLocaleString('id-ID') || 0}`)
      }
    } else {
      console.log('\n❌ ERROR')
      console.log(JSON.stringify(data, null, 2))
    }

  } catch (error) {
    console.log('\n💥 EXCEPTION')
    console.error(error.message)
  }
}

testOrderDetail()
