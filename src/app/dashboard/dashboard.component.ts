import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { Chart, registerables } from 'chart.js';
import * as signalR from '@microsoft/signalr';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  chart: Chart | undefined;
  isLoading = true;
  private hubConnection!: signalR.HubConnection;

  constructor(
    private router: Router, 
    private transactionService: TransactionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
      this.startSignalRConnection();
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  loadInitialData() {
    const username = localStorage.getItem('username');
    this.transactionService.getCategorySummary(username).subscribe({
      next: (data) => {
        this.createChart(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }

  startSignalRConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5209/transactionHub') 
      .build();

    this.hubConnection.start().then(() => {
      console.log("SignalR Connected");
    }).catch(err => {
      console.error("SignalR Connection Error:", err.toString());
    });

    this.hubConnection.on("ReceiveTransaction", (transaction) => {
      console.log("New transaction received:", transaction);
      this.handleNewTransaction(transaction);
    });
  }

  handleNewTransaction(transaction: any) {
    console.log("Processing new transaction:", transaction);
    
    this.refreshChart();
    
  }

  refreshChart() {
    const username = localStorage.getItem('username');
    this.transactionService.getCategorySummary(username).subscribe({
      next: (data) => {
        this.updateChart(data);
      },
      error: (error) => {
        console.error('Error refreshing data:', error);
      }
    });
  }

  updateChart(data: { [category: string]: number }) {
    if (this.chart) {
      this.chart.data.labels = Object.keys(data);
      this.chart.data.datasets[0].data = Object.values(data);
      
      // Re-render the chart
      this.chart.update();
      console.log("Chart updated with new data");
    }
  }

  createChart(data: { [category: string]: number }) {
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  const canvas = this.chartCanvas.nativeElement;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Amount ($)',
          data: Object.values(data),
          backgroundColor: [
            '#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6'
          ],
          borderColor: [
            '#2980b9', '#c0392b', '#e67e22', '#27ae60', '#8e44ad'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Categories'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Amount ($)'
            },
            beginAtZero: true
          }
        }
      }
    });
    console.log("Chart created successfully");
  }
  
  }

  logout() {
    this.router.navigate(['/login']);
  }
}