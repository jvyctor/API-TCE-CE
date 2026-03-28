FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/TceCeProxy.Api/TceCeProxy.Api.csproj", "src/TceCeProxy.Api/"]
RUN dotnet restore "src/TceCeProxy.Api/TceCeProxy.Api.csproj"

COPY . .
RUN dotnet publish "src/TceCeProxy.Api/TceCeProxy.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TceCeProxy.Api.dll"]
