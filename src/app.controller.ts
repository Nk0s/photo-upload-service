import { Controller, Get, Res } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(@InjectQueue('photo') private readonly myQueue: Queue) {}

  @Get('admin/queues')
  async adminQueues(@Res() res: Response) {
    const jobs = await this.myQueue.getJobs([
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
    ]);

    const queueData = {
      name: this.myQueue.name,
      jobs: jobs ? jobs.length : 0,
    };

    return res.json(queueData);
  }
}
