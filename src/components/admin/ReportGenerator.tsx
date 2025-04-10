
{Object.keys(ticketStats.byBranch).length > 0 && adminStats.staffDetails.length > 0 && (
  <Card className="col-span-1 md:col-span-2">
    <CardHeader className="pb-2">
      <CardTitle className="text-right text-base">مقارنة أداء الموظفين</CardTitle>
    </CardHeader>
    <CardContent className="pt-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart
            data={prepareStaffComparativeData()}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="تذاكر_كلية" fill="#8884d8" />
            <Bar dataKey="تم_حلها" fill="#82ca9d" />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
)}
