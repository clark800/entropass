//
//  SecondViewController.h
//  Entropass
//
//  Created by Chris Clark on 5/23/14.
//  Copyright (c) 2014 Rampant Logic. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SecondViewController : UIViewController<UITextFieldDelegate,UIActionSheetDelegate>
@property (weak, nonatomic) IBOutlet UITextField *privateKeyHash;
@property (weak, nonatomic) IBOutlet UILabel *fingerprint;
- (IBAction)save:(id)sender;

@end
