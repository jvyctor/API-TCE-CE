using TceCeProxy.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddTceCeApi(builder.Configuration);

var app = builder.Build();

app.UseTceCeApi();
app.MapTceCeApi();

app.Run();

public partial class Program;
